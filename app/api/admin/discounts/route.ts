import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Create table if not exists
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

    // Seed if empty
    const checkCount = await sql`SELECT COUNT(*) FROM discounts` as any;
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
        await sql`
          INSERT INTO discounts (title, summary, discount_type, status, used_count)
          VALUES (${disc.title}, ${disc.summary}, ${disc.type}, ${disc.status}, ${disc.used})
        `;
      }
      console.log('Seeded discounts successfully.');
    }

    const discounts = await sql`SELECT * FROM discounts ORDER BY id ASC`;
    return NextResponse.json(discounts);
  } catch (error: any) {
    console.error('Error in discounts GET:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

// POST: Create a new discount
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, discount_type } = body;

    if (!title || !summary || !discount_type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO discounts (title, summary, discount_type, status, used_count)
      VALUES (${title}, ${summary}, ${discount_type}, 'Active', 0)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in discounts POST:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
