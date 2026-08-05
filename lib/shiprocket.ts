import 'server-only';

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

type TokenResponse = {
  token?: string;
  message?: string;
  errors?: Record<string, string[] | string>;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

export class ShiprocketError extends Error {}

function getCredentials() {
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new ShiprocketError('Shiprocket credentials are not configured on the server.');
  }

  return { email, password };
}

async function readJson(response: Response): Promise<TokenResponse> {
  try {
    return await response.json() as TokenResponse;
  } catch {
    return {};
  }
}

function getApiMessage(data: TokenResponse, fallback: string) {
  if (data.message) return data.message;
  const firstError = data.errors && Object.values(data.errors).flat().find(Boolean);
  return typeof firstError === 'string' ? firstError : fallback;
}

export async function getShiprocketToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { email, password } = getCredentials();
  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const data = await readJson(response);

  if (!response.ok || !data.token) {
    throw new ShiprocketError(getApiMessage(data, 'Shiprocket authentication failed.'));
  }

  cachedToken = { value: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.token;
}

/** Authenticates and makes a harmless authenticated API request. */
export async function testShiprocketConnection() {
  const token = await getShiprocketToken();
  const response = await fetch(`${SHIPROCKET_API_URL}/orders?page=1&per_page=1`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const data = await readJson(response);
    throw new ShiprocketError(getApiMessage(data, 'Shiprocket API connection could not be verified.'));
  }
}
