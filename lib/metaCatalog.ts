import { Product, getProducts } from './products';
import { getStoreSettings } from './settings';

export interface MetaProductFeedItem {
  id: string;
  title: string;
  description: string;
  availability: 'in stock' | 'out of stock';
  condition: 'new';
  price: string;
  link: string;
  image_link: string;
  brand: string;
  google_product_category: string;
  fb_product_category?: string;
  custom_label_0?: string;
}

/**
 * Generate absolute URL for catalog links
 */
function getAbsoluteUrl(path: string, baseUrl: string): string {
  if (!path) return baseUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats products list into Meta Catalog Item Array
 */
export function formatProductsForMeta(products: Product[], baseUrl: string): MetaProductFeedItem[] {
  return products.map((p) => {
    const pSlug = p.slug || `product-${p.id}`;
    const productLink = getAbsoluteUrl(`/product/${pSlug}`, baseUrl);
    const imageLink = getAbsoluteUrl(p.image_url || '/images/earrings_category.png', baseUrl);
    const category = p.collection || 'Jewelry';

    return {
      id: `DG-${p.id}`,
      title: p.name,
      description: p.description || `${p.name} - Premium artificial jewelry by Deera Glow.`,
      availability: 'in stock',
      condition: 'new',
      price: `${p.price}.00 INR`,
      link: productLink,
      image_link: imageLink,
      brand: 'Deera Glow',
      google_product_category: 'Apparel & Accessories > Jewelry',
      fb_product_category: 'Jewelry',
      custom_label_0: category,
    };
  });
}

/**
 * Generates Meta Commerce Catalog RSS 2.0 / XML Feed
 */
export async function generateMetaXmlFeed(baseUrl: string): Promise<string> {
  const products = await getProducts();
  const items = formatProductsForMeta(products, baseUrl);

  const xmlItems = items
    .map(
      (item) => `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:condition>${escapeXml(item.condition)}</g:condition>
      <g:availability>${escapeXml(item.availability)}</g:availability>
      <g:price>${escapeXml(item.price)}</g:price>
      <g:google_product_category>${escapeXml(item.google_product_category)}</g:google_product_category>
      <g:custom_label_0>${escapeXml(item.custom_label_0 || '')}</g:custom_label_0>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Deera Glow Product Catalog</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Deera Glow Official Meta Commerce Product Catalog Feed</description>
${xmlItems}
  </channel>
</rss>`;
}

/**
 * Generates Meta Commerce Catalog CSV Feed
 */
export async function generateMetaCsvFeed(baseUrl: string): Promise<string> {
  const products = await getProducts();
  const items = formatProductsForMeta(products, baseUrl);

  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'google_product_category', 'custom_label_0'];
  const rows = items.map(item => [
    `"${item.id}"`,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.description.replace(/"/g, '""')}"`,
    `"${item.availability}"`,
    `"${item.condition}"`,
    `"${item.price}"`,
    `"${item.link}"`,
    `"${item.image_link}"`,
    `"${item.brand}"`,
    `"${item.google_product_category}"`,
    `"${(item.custom_label_0 || '').replace(/"/g, '""')}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Sync products directly with Meta Graph API endpoint:
 * POST https://graph.facebook.com/v18.0/{catalog_id}/items_batch
 */
export async function syncProductsToMetaGraphApi(baseUrl: string): Promise<{ success: boolean; message: string; updatedCount: number; details?: any }> {
  const settings = await getStoreSettings();
  const catalogId = settings.metaCatalogId || '1854976142149958';
  const accessToken = settings.metaAccessToken || '';

  const products = await getProducts();
  const metaItems = formatProductsForMeta(products, baseUrl);

  if (!accessToken) {
    return {
      success: false,
      message: 'Meta Access Token missing. Please enter your Access Token in Meta Settings to enable direct Graph API sync.',
      updatedCount: 0
    };
  }

  // Format batch payload for Meta Graph API
  const batchRequests = metaItems.map(item => ({
    method: 'UPDATE',
    retailer_id: item.id,
    data: {
      title: item.title,
      description: item.description,
      availability: item.availability,
      condition: item.condition,
      price: item.price,
      link: item.link,
      image_link: item.image_link,
      brand: item.brand,
      google_product_category: item.google_product_category,
      custom_label_0: item.custom_label_0
    }
  }));

  try {
    const url = `https://graph.facebook.com/v18.0/${catalogId}/items_batch?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: batchRequests
      })
    });

    const data = await res.json();

    if (res.ok && !data.error) {
      return {
        success: true,
        message: `Successfully synced ${metaItems.length} products to Meta Catalog (ID: ${catalogId}).`,
        updatedCount: metaItems.length,
        details: data
      };
    } else {
      return {
        success: false,
        message: data?.error?.message || 'Meta API returned an error during catalog update.',
        updatedCount: 0,
        details: data
      };
    }
  } catch (err: any) {
    console.error('Error syncing to Meta Graph API:', err);
    return {
      success: false,
      message: `Failed to connect to Meta API: ${err.message || 'Network error'}`,
      updatedCount: 0
    };
  }
}
