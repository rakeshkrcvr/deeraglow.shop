import 'server-only';

import { sql } from './db';
import { getStoreSettings } from './settings';

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_TTL_MS = 240 * 60 * 60 * 1000;

type ApiResponse = Record<string, unknown> & { token?: string; message?: string; errors?: Record<string, string[] | string> };
type StoredToken = { value: string; expiresAt: number };

export type ShiprocketOrderInput = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  subtotal: string;
  items: Array<{ product_id?: unknown; name?: unknown; quantity?: unknown; price?: unknown }>;
};

let cachedToken: StoredToken | null = null;

export class ShiprocketError extends Error {
  constructor(message: string, public readonly response?: ApiResponse, public readonly status?: number) {
    super(message);
  }
}

function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = ['password', 'token', 'authorization'].includes(key.toLowerCase()) ? '[REDACTED]' : redact(item);
  }
  return copy;
}

function log(event: string, details: Record<string, unknown>) {
  console.info(`[Shiprocket] ${event}`, redact(details));
}

async function readJson(response: Response): Promise<ApiResponse> {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) as ApiResponse : {}; } catch { return { raw_response: raw }; }
}

function getApiMessage(data: ApiResponse, fallback: string) {
  if (typeof data.message === 'string' && data.message) return data.message;
  const firstError = data.errors && Object.values(data.errors).flat().find(Boolean);
  return typeof firstError === 'string' ? firstError : fallback;
}

function getCreatedOrderId(data: ApiResponse) {
  if (data.order_id !== undefined && data.order_id !== null) return String(data.order_id);
  const nested = data.data;
  if (nested && typeof nested === 'object' && 'order_id' in nested && (nested as Record<string, unknown>).order_id !== undefined) {
    return String((nested as Record<string, unknown>).order_id);
  }
  return '';
}

function tokenExpiry(token: string, issuedAt?: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as { exp?: number };
    if (payload.exp) return payload.exp * 1000 - 60_000;
  } catch { /* Use the saved issue time below for opaque tokens. */ }
  return (Number(issuedAt) || Date.now()) + TOKEN_TTL_MS - 60_000;
}

async function saveSetting(key: string, value: string) {
  await sql`INSERT INTO store_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

async function getCredentials() {
  const settings = await getStoreSettings();
  const email = settings.shiprocketEmail?.trim() || process.env.SHIPROCKET_EMAIL?.trim();
  const password = settings.shiprocketPassword || process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new ShiprocketError('Shiprocket API email and password are not configured.');
  return { email, password, settings };
}

async function login(force = false) {
  const { email, password, settings } = await getCredentials();
  const savedToken = settings.shiprocketToken?.trim();
  const savedExpiry = savedToken ? tokenExpiry(savedToken, settings.shiprocketTokenIssuedAt) : 0;
  if (!force && cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  if (!force && savedToken && savedExpiry > Date.now()) {
    cachedToken = { value: savedToken, expiresAt: savedExpiry };
    return savedToken;
  }

  const url = `${SHIPROCKET_API_URL}/auth/login`;
  log('request', { method: 'POST', url, body: { email, password: '[REDACTED]' } });
  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    console.error('[Shiprocket] request failed', { method: 'POST', url, error });
    throw new ShiprocketError('Shiprocket authentication request failed.');
  }
  const data = await readJson(response);
  log('response', { method: 'POST', url, status: response.status, body: data });
  if (!response.ok || !data.token) throw new ShiprocketError(getApiMessage(data, 'Shiprocket authentication failed.'), data, response.status);

  const expiresAt = tokenExpiry(data.token, String(Date.now()));
  cachedToken = { value: data.token, expiresAt };
  await saveSetting('shiprocketToken', data.token);
  await saveSetting('shiprocketTokenIssuedAt', String(Date.now()));
  return data.token;
}

export async function getShiprocketToken() { return login(); }

async function authorizedRequest(path: string, init: RequestInit, retryAfterRefresh = true) {
  const url = `${SHIPROCKET_API_URL}${path}`;
  const makeRequest = async (token: string) => {
    log('request', { method: init.method || 'GET', url, body: init.body ? JSON.parse(String(init.body)) : undefined });
    try {
      const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers, Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      const data = await readJson(response);
      log('response', { method: init.method || 'GET', url, status: response.status, body: data });
      return { response, data };
    } catch (error) {
      console.error('[Shiprocket] request failed', { method: init.method || 'GET', url, error });
      throw new ShiprocketError('Shiprocket request failed.');
    }
  };

  let result = await makeRequest(await login());
  if (retryAfterRefresh && (result.response.status === 401 || result.response.status === 403)) {
    cachedToken = null;
    log('token refresh', { reason: `HTTP ${result.response.status}`, url });
    result = await makeRequest(await login(true));
  }
  return result;
}

function money(value: string) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function addressParts(address: string) {
  const lines = address.split(/\n|,/).map(value => value.trim()).filter(Boolean);
  const pincode = (address.match(/\b\d{6}\b/)?.[0]) || '';
  const originalLines = address.split(/\n/).map(value => value.trim()).filter(Boolean);
  const cityStateLine = originalLines.findLast(value => value.includes(',')) || '';
  const cityState = cityStateLine.split(',').map(value => value.trim()).filter(Boolean);
  return { address: lines.filter(value => !/^PIN\s*\d{6}$/i.test(value)).join(', '), city: cityState[0] || '', state: cityState[1] || '', pincode };
}

export async function createShiprocketOrder(input: ShiprocketOrderInput) {
  const { settings } = await getCredentials();
  const pickupLocation = settings.shiprocketPickupLocation?.trim();
  const { address, city, state, pincode } = addressParts(input.address);
  const [firstName, ...lastName] = input.customerName.trim().split(/\s+/);
  if (!pickupLocation) throw new ShiprocketError('Shiprocket pickup location is not configured.');
  if (!firstName || !address || !city || !state || !pincode || !input.phone || input.items.length === 0) throw new ShiprocketError('Order is missing required Shiprocket shipping details.');

  const payload = {
    order_id: input.orderNumber.replace(/^#/, ''),
    order_date: new Date().toISOString().slice(0, 10),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName.join(' ') || firstName,
    billing_address: address,
    billing_address_2: '',
    billing_city: city,
    billing_pincode: pincode,
    billing_state: state,
    billing_country: 'India',
    billing_email: input.email,
    billing_phone: input.phone.replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: input.items.map((item, index) => ({ sku: `DG-${String(item.product_id || index + 1)}`, name: String(item.name || 'Deera Glow item'), units: Math.max(1, Number(item.quantity) || 1), selling_price: money(String(item.price || '0')), discount: 0, tax: 0, hsn_code: '' })),
    payment_method: /cash on delivery|cod/i.test(input.paymentMethod) ? 'COD' : 'Prepaid',
    sub_total: money(input.subtotal),
    length: Number(settings.shiprocketPackageLength) || 10,
    breadth: Number(settings.shiprocketPackageBreadth) || 10,
    height: Number(settings.shiprocketPackageHeight) || 5,
    weight: Number(settings.shiprocketPackageWeight) || 0.5,
  };
  log('Starting Shiprocket sync', { localOrderNumber: input.orderNumber });
  const { response, data } = await authorizedRequest('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(payload) });
  // Shiprocket can reply with HTTP 200 for validation errors. An order is only
  // considered synced when its API response contains the generated order ID.
  if (!response.ok || !getCreatedOrderId(data)) {
    throw new ShiprocketError(getApiMessage(data, 'Shiprocket did not return an order ID.'), data, response.status);
  }
  return data;
}

export function getShiprocketCreatedOrderId(data: ApiResponse) {
  return getCreatedOrderId(data);
}

/** Authenticates and makes a harmless authenticated API request. */
export async function testShiprocketConnection() {
  const { response, data } = await authorizedRequest('/orders?page=1&per_page=1', { method: 'GET' });
  if (!response.ok) throw new ShiprocketError(getApiMessage(data, 'Shiprocket API connection could not be verified.'), data, response.status);
}
