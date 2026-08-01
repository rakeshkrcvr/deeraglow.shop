import { NextResponse } from 'next/server';

const LIVE_PRODUCTS_URL = 'https://www.deeraglow.shop/api/admin/products';

// Local development does not have the production database credentials. This
// same-origin proxy lets the local admin preview the catalog currently live.
export async function GET() {
  try {
    const response = await fetch(LIVE_PRODUCTS_URL, { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unable to load the live inventory.' },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json(await response.json(), {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
    });
  } catch (error) {
    console.error('Error proxying live inventory:', error);
    return NextResponse.json({ error: 'Unable to reach the live inventory.' }, { status: 502 });
  }
}

export const dynamic = 'force-dynamic';
