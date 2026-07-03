import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS drafts (
        id SERIAL PRIMARY KEY,
        draft_number VARCHAR(50) NOT NULL,
        date_str VARCHAR(100) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        total_price VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        items_count VARCHAR(50) NOT NULL
      )
    `;

    // Seed if empty
    const checkCount = await sql`SELECT COUNT(*) FROM drafts` as any;
    const count = parseInt(checkCount[0].count, 10);

    if (count === 0) {
      await sql`
        INSERT INTO drafts (draft_number, date_str, customer, total_price, status, items_count)
        VALUES ('#D1001', 'Jul 3 at 3:30 pm', 'Rohan Sharma', '₹1,598.00', 'Open', '2 items')
      `;
      await sql`
        INSERT INTO drafts (draft_number, date_str, customer, total_price, status, items_count)
        VALUES ('#D1002', 'Jul 2 at 11:15 am', 'Priya Kapoor', '₹899.00', 'Open', '1 item')
      `;
    }

    const drafts = await sql`SELECT * FROM drafts ORDER BY id DESC`;
    return NextResponse.json(drafts);
  } catch (error: any) {
    console.error('Error in drafts GET:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

// POST: Create draft
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, total_price, items_count } = body;

    if (!customer || !total_price || !items_count) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const draftNum = `#D${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    await sql`
      INSERT INTO drafts (draft_number, date_str, customer, total_price, status, items_count)
      VALUES (${draftNum}, ${dateStr}, ${customer}, ${total_price}, 'Open', ${items_count})
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating draft:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

// PUT: Complete Draft -> Move to Orders table
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Retrieve draft details
    const draftRes = await sql`SELECT * FROM drafts WHERE id = ${parseInt(id, 10)}` as any;
    if (draftRes.length === 0) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const draft = draftRes[0];

    // Delete draft
    await sql`DELETE FROM drafts WHERE id = ${draft.id}`;

    // Insert into orders table
    const orderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    await sql`
      INSERT INTO orders (order_number, date_str, customer, channel, total_price, payment_status, fulfillment_status, items_count, delivery_status)
      VALUES (${orderNum}, ${dateStr}, ${draft.customer}, 'Draft Invoice', ${draft.total_price}, 'Paid', 'Fulfilled', ${draft.items_count}, 'Delivered')
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error completing draft:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
