import { NextResponse } from 'next/server';
import { generateMetaCsvFeed } from '@/lib/metaCatalog';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const csvContent = await generateMetaCsvFeed(baseUrl);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': 'inline; filename="meta_catalog_products.csv"'
      }
    });
  } catch (error: unknown) {
    console.error('Error generating Meta CSV Feed:', error);
    return new NextResponse(`Error: ${getErrorMessage(error)}`, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
