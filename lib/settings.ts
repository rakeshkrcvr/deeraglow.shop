import { sql } from './db';

export const defaultStoreSettings: Record<string, string> = {
  isGokwikActive: 'true',
  isCodActive: 'true',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  shiprocketEmail: '',
  shiprocketPassword: '',
  shiprocketToken: '',
  instagramUrl: 'https://instagram.com/deekshacandles',
  facebookUrl: 'https://facebook.com/deekshacandles',
  pinterestUrl: 'https://pinterest.com/deekshacandles',
  twitterUrl: '',
  youtubeUrl: '',
  logoHeaderUrl: '',
  logoFooterUrl: '',
  heroEyebrow: 'DEEKSHA RITUALS',
  heroTitle: 'The Art of',
  heroItalicTitle: 'Slow Burning',
  heroDescription: 'Ancestral scents mindfully crafted in small batches. Poured with 100% organic soy wax, pure botanical extracts, and wood wicks to ground your soul and illuminate your sanctuary.',
  heroPrimaryButtonText: 'Discover Our Rituals',
  heroPrimaryButtonHref: '#products',
  heroSecondaryButtonText: 'Our Philosophy',
  heroSecondaryButtonHref: '#story',
  heroFloatingTag: 'Batch No. 042 / Sandalwood',
  heroSliderImages: '["/images/hero_candle.png"]',
  contentBlogPosts: '[{"id":1,"title":"How to Trim Candle Wicks for a Clean Burn","author":"Deeksha Sharma","date":"Jul 2, 2026","status":"Published"},{"id":2,"title":"Choosing the Right Aromatherapy Scent for Sleep","author":"Deeksha Sharma","date":"Jun 28, 2026","status":"Published"},{"id":3,"title":"Why Soy Wax is Better than Paraffin Wax","author":"Rohan Sen","date":"Jun 24, 2026","status":"Published"}]',
  contentNavigationMenus: '[{"id":1,"menu":"Main Menu","links":"Home - Shop - Fragrance - Occasions - About Us - Blogs"},{"id":2,"menu":"Footer Collection List","links":"Scented Candles - Soy Wax - Jar Candles - Luxury Collection"},{"id":3,"menu":"Footer Scent Categories","links":"Vanilla - Lavender - Rose - Jasmine - Sandalwood - Coffee"}]'
};

export async function ensureStoreSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
}

export async function getStoreSettings() {
  await ensureStoreSettingsTable();

  const rows = await sql`SELECT * FROM store_settings` as unknown as { key: string, value: string }[];
  const settings: Record<string, string> = {};
  rows.forEach(row => {
    settings[row.key] = row.value;
  });

  return { ...defaultStoreSettings, ...settings };
}
