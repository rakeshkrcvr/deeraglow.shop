import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY id ASC`;
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
