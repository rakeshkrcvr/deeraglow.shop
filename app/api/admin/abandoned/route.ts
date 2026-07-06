import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';

type CountRow = { count: string };
type MaxCheckoutRow = { max: number | null };

async function ensureAbandonedCheckoutsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS abandoned_checkouts (
      id SERIAL PRIMARY KEY,
      checkout_number VARCHAR(50) NOT NULL,
      date_str VARCHAR(100) NOT NULL,
      customer VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      total_price VARCHAR(50) NOT NULL,
      items_count VARCHAR(50) NOT NULL,
      recovery_status VARCHAR(50) NOT NULL
    )
  `;

  await sql`ALTER TABLE abandoned_checkouts ADD COLUMN IF NOT EXISTS client_reference VARCHAR(100)`;
  await sql`ALTER TABLE abandoned_checkouts ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`;
  await sql`ALTER TABLE abandoned_checkouts ADD COLUMN IF NOT EXISTS address TEXT`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS abandoned_checkouts_client_reference_idx ON abandoned_checkouts (client_reference) WHERE client_reference IS NOT NULL`;
}

function formatCheckoutDate() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(',', ' at').toLowerCase();
}

function normalizeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export async function GET() {
  try {
    await ensureAbandonedCheckoutsTable();

    // Seed if empty
    const checkCount = await sql`SELECT COUNT(*) FROM abandoned_checkouts` as unknown as CountRow[];
    const count = parseInt(checkCount[0].count, 10);

    if (count === 0) {
      await sql`
        INSERT INTO abandoned_checkouts (checkout_number, date_str, customer, email, total_price, items_count, recovery_status)
        VALUES ('#C5082', 'Jul 3 at 1:12 pm', 'Rakesh Nair', 'rakesh@gmail.com', '₹899.00', '1 item', 'Not sent')
      `;
      await sql`
        INSERT INTO abandoned_checkouts (checkout_number, date_str, customer, email, total_price, items_count, recovery_status)
        VALUES ('#C5081', 'Jul 2 at 6:45 pm', 'Komal Shah', 'komal.s@yahoo.com', '₹1,798.50', '2 items', 'Not sent')
      `;
      await sql`
        INSERT INTO abandoned_checkouts (checkout_number, date_str, customer, email, total_price, items_count, recovery_status)
        VALUES ('#C5080', 'Jul 2 at 10:20 am', 'Vikram Sen', 'vikram@gmail.com', '₹2,697.00', '3 items', 'Sent')
      `;
    }

    const checkouts = await sql`SELECT * FROM abandoned_checkouts ORDER BY id DESC`;
    return NextResponse.json(checkouts);
  } catch (error: unknown) {
    console.error('Error in checkouts GET:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureAbandonedCheckoutsTable();

    const body = await request.json();
    const clientReference = normalizeText(body.client_reference);
    const firstName = normalizeText(body.first_name);
    const lastName = normalizeText(body.last_name);
    const customer = normalizeText(
      body.customer,
      `${firstName} ${lastName}`.trim() || normalizeText(body.email) || normalizeText(body.phone) || 'Guest customer'
    );
    const email = normalizeText(body.email, 'Not provided');
    const phone = normalizeText(body.phone);
    const addressParts = [
      body.address,
      body.apartment,
      body.city,
      body.state,
      body.pincode
    ].map((part) => normalizeText(part)).filter(Boolean);
    const address = addressParts.join(', ');
    const totalPrice = normalizeText(body.total_price, '₹0.00');
    const itemsCount = normalizeText(body.items_count, '0 items');
    const dateStr = formatCheckoutDate();

    if (!clientReference) {
      return NextResponse.json({ error: 'Missing client reference' }, { status: 400 });
    }

    const existing = await sql`
      SELECT id, checkout_number
      FROM abandoned_checkouts
      WHERE client_reference = ${clientReference}
      LIMIT 1
    ` as unknown as { id: number; checkout_number: string }[];

    if (existing.length > 0) {
      await sql`
        UPDATE abandoned_checkouts
        SET
          date_str = ${dateStr},
          customer = ${customer},
          email = ${email},
          total_price = ${totalPrice},
          items_count = ${itemsCount},
          recovery_status = 'Not sent',
          phone = ${phone},
          address = ${address}
        WHERE id = ${existing[0].id}
      `;

      return NextResponse.json({ success: true, checkout_number: existing[0].checkout_number });
    }

    const rows = await sql`SELECT MAX(id) FROM abandoned_checkouts` as unknown as MaxCheckoutRow[];
    const nextNumber = (rows[0]?.max || 5082) + 1;
    const checkoutNumber = `#C${nextNumber}`;

    await sql`
      INSERT INTO abandoned_checkouts (
        checkout_number,
        date_str,
        customer,
        email,
        total_price,
        items_count,
        recovery_status,
        client_reference,
        phone,
        address
      )
      VALUES (
        ${checkoutNumber},
        ${dateStr},
        ${customer},
        ${email},
        ${totalPrice},
        ${itemsCount},
        'Not sent',
        ${clientReference},
        ${phone},
        ${address}
      )
    `;

    return NextResponse.json({ success: true, checkout_number: checkoutNumber });
  } catch (error: unknown) {
    console.error('Error creating abandoned checkout:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT: Mark email as sent
export async function PUT(request: Request) {
  try {
    await ensureAbandonedCheckoutsTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await sql`
      UPDATE abandoned_checkouts
      SET recovery_status = 'Sent'
      WHERE id = ${parseInt(id, 10)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating checkout:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
