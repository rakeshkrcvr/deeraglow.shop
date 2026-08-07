import { createHash, randomUUID } from "crypto";

type OrderItem = {
  product_id?: unknown;
  quantity?: unknown;
  price?: unknown;
};

type PurchaseEventInput = {
  pixelId: string;
  accessToken: string;
  eventId: string;
  value: number;
  email?: string;
  phone?: string;
  items: unknown;
  request: Request;
};

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

const numericPrice = (value: unknown) => {
  const amount = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

export async function sendMetaPurchaseEvent(input: PurchaseEventInput) {
  const { pixelId, accessToken, eventId, value, email, phone, items, request } = input;
  if (!pixelId || !accessToken) return { sent: false, reason: "not-configured" as const };

  const contents = Array.isArray(items)
    ? items.map((item: OrderItem) => ({
        id: String(item.product_id ?? ""),
        quantity: Math.max(Number(item.quantity) || 1, 1),
        item_price: numericPrice(item.price),
      })).filter(item => item.id)
    : [];

  const userData: Record<string, string> = {};
  if (email?.trim()) userData.em = sha256(email);
  if (phone?.trim()) userData.ph = sha256(phone.replace(/\D/g, ""));

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientUserAgent = request.headers.get("user-agent") || undefined;
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;

  const origin = request.headers.get("origin") || "https://www.deeraglow.shop";
  const response = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || randomUUID(),
        event_source_url: origin,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: "INR",
          value,
          content_type: "product",
          content_ids: contents.map(item => item.id),
          contents,
          order_id: eventId,
        },
      }],
      ...(process.env.META_PIXEL_TEST_EVENT_CODE ? { test_event_code: process.env.META_PIXEL_TEST_EVENT_CODE } : {}),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Meta Conversions API returned ${response.status}: ${details.slice(0, 300)}`);
  }

  return { sent: true as const };
}
