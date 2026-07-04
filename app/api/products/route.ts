import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
