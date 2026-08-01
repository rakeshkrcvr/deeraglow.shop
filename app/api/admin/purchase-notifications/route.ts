import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import { ensureStoreSettingsTable } from '@/lib/settings';
import { defaultPurchaseNotifications, PurchaseNotification, normalizePurchaseNotifications } from '@/lib/purchaseNotifications';

const SETTINGS_KEY = 'purchaseNotifications';

function isNotificationList(value: unknown): value is PurchaseNotification[] {
  return Array.isArray(value) && value.length >= 50;
}

export async function GET() {
  try {
    await ensureStoreSettingsTable();
    const rows = await sql`
      SELECT value FROM store_settings WHERE key = ${SETTINGS_KEY} LIMIT 1
    ` as unknown as { value: string }[];

    if (!rows[0]?.value) {
      await sql`
        INSERT INTO store_settings (key, value)
        VALUES (${SETTINGS_KEY}, ${JSON.stringify(defaultPurchaseNotifications)})
        ON CONFLICT (key) DO NOTHING
      `;
      return NextResponse.json({ notifications: defaultPurchaseNotifications }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
      });
    }

    const parsed: unknown = JSON.parse(rows[0].value);
    if (!isNotificationList(parsed)) {
      return NextResponse.json({ notifications: null });
    }

    return NextResponse.json({ notifications: normalizePurchaseNotifications(parsed) }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
    });
  } catch (error: unknown) {
    console.error('Error fetching purchase notifications:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    const notifications = typeof body === 'object' && body !== null
      ? (body as { notifications?: unknown }).notifications
      : undefined;

    if (!isNotificationList(notifications)) {
      return NextResponse.json({ error: 'At least 50 purchase notifications are required.' }, { status: 400 });
    }

    await ensureStoreSettingsTable();
    const normalized = normalizePurchaseNotifications(notifications);
    await sql`
      INSERT INTO store_settings (key, value)
      VALUES (${SETTINGS_KEY}, ${JSON.stringify(normalized)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    return NextResponse.json({ notifications: normalized });
  } catch (error: unknown) {
    console.error('Error saving purchase notifications:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
