import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createShiprocketOrder, getShiprocketCreatedOrderId, ShiprocketError } from '@/lib/shiprocket';
import { getErrorMessage } from '@/lib/errors';

type LocalOrder = {
  order_number: string;
  customer: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  payment_method?: string | null;
  subtotal?: string | null;
  total_price?: string | null;
  order_items?: string | null;
};

/** Replays one local order after correcting configuration; it never creates a new local order. */
export async function POST(request: Request) {
  try {
    const { order_number } = await request.json() as { order_number?: string };
    if (!order_number) return NextResponse.json({ error: 'order_number is required.' }, { status: 400 });
    const rows = await sql`SELECT * FROM orders WHERE order_number = ${order_number} LIMIT 1` as unknown as LocalOrder[];
    const order = rows[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    let items: Array<{ product_id?: unknown; name?: unknown; quantity?: unknown; price?: unknown }> = [];
    try {
      const parsed: unknown = JSON.parse(order.order_items || '[]');
      if (Array.isArray(parsed)) items = parsed.filter((item): item is { product_id?: unknown; name?: unknown; quantity?: unknown; price?: unknown } => Boolean(item) && typeof item === 'object');
    } catch { /* Validation below records the Shiprocket error. */ }
    console.info('[Shiprocket] Starting manual sync retry', { localOrderNumber: order.order_number });
    try {
      const response = await createShiprocketOrder({
        orderNumber: order.order_number,
        customerName: order.customer,
        email: order.customer_email || '',
        phone: order.customer_phone || '',
        address: order.shipping_address || '',
        paymentMethod: order.payment_method || '',
        subtotal: order.subtotal || order.total_price || '',
        items,
      });
      const shiprocketOrderId = getShiprocketCreatedOrderId(response);
      await sql`UPDATE orders SET shiprocket_sync_status = 'synced', shiprocket_order_id = ${shiprocketOrderId}, shiprocket_response = ${JSON.stringify(response)}, shiprocket_error = NULL, shiprocket_synced_at = NOW() WHERE order_number = ${order.order_number}`;
      return NextResponse.json({ success: true, order_number: order.order_number, shiprocket_order_id: shiprocketOrderId, response });
    } catch (error) {
      const details = error instanceof ShiprocketError ? { message: error.message, status: error.status, response: error.response } : { message: getErrorMessage(error) };
      console.error('[Shiprocket] manual sync retry failed', { localOrderNumber: order.order_number, details });
      await sql`UPDATE orders SET shiprocket_sync_status = 'failed', shiprocket_error = ${JSON.stringify(details)} WHERE order_number = ${order.order_number}`;
      return NextResponse.json({ success: false, order_number: order.order_number, error: details }, { status: 502 });
    }
  } catch (error) {
    console.error('[Shiprocket] manual sync endpoint failed', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
