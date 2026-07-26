import { NextResponse } from 'next/server';
import { syncProductsToMetaGraphApi, formatProductsForMeta } from '@/lib/metaCatalog';
import { getProducts } from '@/lib/products';
import { getStoreSettings } from '@/lib/settings';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const products = await getProducts();
    const formatted = formatProductsForMeta(products, baseUrl);
    const settings = await getStoreSettings();

    return NextResponse.json({
      catalogId: settings.metaCatalogId || '1854976142149958',
      businessId: settings.metaBusinessId || '534361075958208',
      hasToken: !!settings.metaAccessToken,
      productCount: products.length,
      feedUrlXml: `${baseUrl}/api/meta-catalog/feed.xml`,
      feedUrlCsv: `${baseUrl}/api/meta-catalog/feed.csv`,
      products: formatted
    });
  } catch (error: unknown) {
    console.error('Error fetching Meta Catalog sync status:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const result = await syncProductsToMetaGraphApi(baseUrl);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error during Meta Catalog sync:', error);
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error),
      updatedCount: 0
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
