import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';

type CountRow = { count: string };

async function ensureDiscountsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS discounts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      discount_type VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      used_count INT NOT NULL DEFAULT 0
    )
  `;

  await sql`ALTER TABLE discounts ADD COLUMN IF NOT EXISTS value_type VARCHAR(30) NOT NULL DEFAULT 'fixed'`;
  await sql`ALTER TABLE discounts ADD COLUMN IF NOT EXISTS value_amount NUMERIC(10, 2) NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE discounts ADD COLUMN IF NOT EXISTS minimum_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0`;
}

function cleanCode(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, '') : '';
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferValueType(title: string, summary: string) {
  return `${title} ${summary}`.includes('%') ? 'percentage' : 'fixed';
}

function inferValueAmount(title: string, summary: string) {
  const percentMatch = summary.match(/(\d+(?:\.\d+)?)\s*%/) || title.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) return parseNumber(percentMatch[1]);

  const rupeeMatch = summary.match(/₹\s*([\d,]+(?:\.\d+)?)/);
  if (rupeeMatch) return parseNumber(rupeeMatch[1]);

  const codeNumberMatch = title.match(/(\d+(?:\.\d+)?)/);
  if (codeNumberMatch) return parseNumber(codeNumberMatch[1]);

  const summaryNumberMatch = summary.match(/(\d+(?:\.\d+)?)/);
  return summaryNumberMatch ? parseNumber(summaryNumberMatch[1]) : 0;
}

function inferMinimumOrder(summary: string) {
  const minMatch = summary.match(/purchase of\s*₹\s*([\d,]+(?:\.\d+)?)/i);
  return minMatch ? parseNumber(minMatch[1]) : 0;
}

export async function GET() {
  try {
    await ensureDiscountsTable();

    // Seed if empty
    const checkCount = await sql`SELECT COUNT(*) FROM discounts` as unknown as CountRow[];
    const count = parseInt(checkCount[0].count, 10);

    if (count === 0) {
      const seedDiscounts = [
        { title: 'CRR15', summary: '15% off 6 collections', type: 'Amount off product', status: 'Active', used: 0 },
        { title: 'F&F25', summary: '25% off 6 collections', type: 'Amount off product', status: 'Active', used: 1 },
        { title: 'f&f50', summary: '50% off 6 collections', type: 'Amount off product', status: 'Active', used: 0 },
        { title: '2999 - Free Gift', summary: '15% off 27 collections on purchase of ₹2,999', type: 'Amount off product', status: 'Active', used: 0 },
        { title: '1999 +Extra 10%', summary: '10% off 27 collections on purchase of ₹1,999', type: 'Amount off product', status: 'Active', used: 0 },
        { title: '999 + Extra 5%', summary: '5% off 27 collections on purchase of ₹999', type: 'Amount off product', status: 'Active', used: 0 },
        { title: 'DC2500', summary: '₹2,500.00 off 2 collections once per order', type: 'Amount off product', status: 'Active', used: 1 },
        { title: 'FT10', summary: '10% off 11 products', type: 'Amount off product', status: 'Active', used: 1 },
        { title: 'buy 2 get 2 free', summary: 'Buy 2 items, get 2 items free', type: 'Buy X get Y', status: 'Active', used: 0 },
        { title: 'Buy 2 Get 2 Free rk', summary: 'Buy 2 items, get 2 items free', type: 'Buy X get Y', status: 'Expired', used: 0 }
      ];

      for (const disc of seedDiscounts) {
        const valueType = inferValueType(disc.title, disc.summary);
        const valueAmount = inferValueAmount(disc.title, disc.summary);
        const minimumOrderValue = inferMinimumOrder(disc.summary);
        await sql`
          INSERT INTO discounts (title, summary, discount_type, status, used_count, value_type, value_amount, minimum_order_value)
          VALUES (${disc.title}, ${disc.summary}, ${disc.type}, ${disc.status}, ${disc.used}, ${valueType}, ${valueAmount}, ${minimumOrderValue})
        `;
      }
      console.log('Seeded discounts successfully.');
    }

    const legacyRows = await sql`
      SELECT id, title, summary
      FROM discounts
      WHERE value_amount = 0
    ` as unknown as { id: number; title: string; summary: string }[];

    for (const row of legacyRows) {
      const valueType = inferValueType(row.title, row.summary);
      const valueAmount = inferValueAmount(row.title, row.summary);
      const minimumOrderValue = inferMinimumOrder(row.summary);
      await sql`
        UPDATE discounts
        SET value_type = ${valueType}, value_amount = ${valueAmount}, minimum_order_value = ${minimumOrderValue}
        WHERE id = ${row.id}
      `;
    }

    const discounts = await sql`SELECT * FROM discounts ORDER BY id ASC`;
    return NextResponse.json(discounts);
  } catch (error: unknown) {
    console.error('Error in discounts GET:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST: Create a new discount
export async function POST(request: Request) {
  try {
    await ensureDiscountsTable();

    const body = await request.json();
    const title = cleanCode(body.title);
    const summary = cleanText(body.summary);
    const discountType = cleanText(body.discount_type);
    const valueType = cleanText(body.value_type) === 'percentage' ? 'percentage' : 'fixed';
    const valueAmount = parseNumber(body.value_amount);
    const minimumOrderValue = parseNumber(body.minimum_order_value);

    if (!title || !summary || !discountType || valueAmount <= 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO discounts (title, summary, discount_type, status, used_count, value_type, value_amount, minimum_order_value)
      VALUES (${title}, ${summary}, ${discountType}, 'Active', 0, ${valueType}, ${valueAmount}, ${minimumOrderValue})
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in discounts POST:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDiscountsTable();

    const body = await request.json();
    const id = parseNumber(body.id);
    const title = cleanCode(body.title);
    const summary = cleanText(body.summary);
    const discountType = cleanText(body.discount_type);
    const status = cleanText(body.status) === 'Expired' ? 'Expired' : 'Active';
    const valueType = cleanText(body.value_type) === 'percentage' ? 'percentage' : 'fixed';
    const valueAmount = parseNumber(body.value_amount);
    const minimumOrderValue = parseNumber(body.minimum_order_value);

    if (!id || !title || !summary || !discountType || valueAmount <= 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sql`
      UPDATE discounts
      SET
        title = ${title},
        summary = ${summary},
        discount_type = ${discountType},
        status = ${status},
        value_type = ${valueType},
        value_amount = ${valueAmount},
        minimum_order_value = ${minimumOrderValue}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in discounts PATCH:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDiscountsTable();

    const body = await request.json();
    const id = parseNumber(body.id);
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await sql`
      UPDATE discounts
      SET used_count = used_count + 1
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in discounts PUT:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
