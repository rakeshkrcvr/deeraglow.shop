import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Create table if not exists
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

    // Seed if empty
    const checkCount = await sql`SELECT COUNT(*) FROM abandoned_checkouts` as any;
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
  } catch (error: any) {
    console.error('Error in checkouts GET:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

// PUT: Mark email as sent
export async function PUT(request: Request) {
  try {
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
  } catch (error: any) {
    console.error('Error updating checkout:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
