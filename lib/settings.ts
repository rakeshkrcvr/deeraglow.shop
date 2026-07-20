import { sql } from './db';

export const defaultStoreSettings: Record<string, string> = {
  isGokwikActive: 'true',
  isCodActive: 'true',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  shiprocketEmail: '',
  shiprocketPassword: '',
  shiprocketToken: '',
  googleTagId: '',
  googleTagCode: '',
  facebookPixelId: '',
  facebookPixelCode: '',
  instagramUrl: 'https://instagram.com/deeraglow',
  facebookUrl: 'https://facebook.com/deeraglow',
  pinterestUrl: 'https://pinterest.com/deeraglow',
  twitterUrl: '',
  youtubeUrl: '',
  logoHeaderUrl: '',
  logoFooterUrl: '',
  heroEyebrow: 'TIMELESS BEAUTY',
  heroTitle: 'Shine Brighter',
  heroItalicTitle: 'Every Day',
  heroDescription: 'Discover handcrafted jewelry that celebrates your unique style and every special moment.',
  heroPrimaryButtonText: 'Shop Collection',
  heroPrimaryButtonHref: '#shop-by-collection',
  heroSecondaryButtonText: 'New Arrivals',
  heroSecondaryButtonHref: '#products',
  heroFloatingTag: '925 Sterling Silver',
  heroSliderImages: '["/images/hero_slide_1.png", "/images/hero_slide_2.png", "/images/hero_slide_3.png"]',
  contentBlogPosts: '[{"id":1,"title":"How to Style Minimalist Gold Jewelry","author":"Deera Sharma","date":"Jul 2, 2026","status":"Published"},{"id":2,"title":"The Ultimate Guide to Stacking Rings","author":"Deera Sharma","date":"Jun 28, 2026","status":"Published"},{"id":3,"title":"Why 925 Sterling Silver is Perfect for Daily Wear","author":"Rohan Sen","date":"Jun 24, 2026","status":"Published"}]',
  contentNavigationMenus: '[{"id":1,"menu":"Main Menu","links":"Home - Shop - Rings - Necklaces - About Us - Blogs"},{"id":2,"menu":"Footer Collection List","links":"Rings - Bracelets - Necklaces - Earrings"},{"id":3,"menu":"Footer Scent Categories","links":"Gold Plated - Sterling Silver - Charms - Best Sellers"}]'
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

  // Auto-migration check: if table contains candle data, overwrite in database
  let needsMigration = false;
  if (rows.length > 0) {
    for (const row of rows) {
      if (row.key === 'heroEyebrow' && row.value === 'DEEKSHA RITUALS') {
        needsMigration = true;
        break;
      }
      if (row.key === 'heroTitle' && row.value === 'The Art of') {
        needsMigration = true;
        break;
      }
      if (row.value && (row.value.includes('DEEKSHA') || row.value.includes('candle') || row.value.includes('Candle'))) {
        needsMigration = true;
        break;
      }
    }
  } else {
    // Empty settings table, we will populate defaults on demand
    needsMigration = true;
  }

  if (needsMigration) {
    console.log('Migrating store settings from candle to jewelry theme in database...');
    try {
      for (const [key, val] of Object.entries(defaultStoreSettings)) {
        await sql`
          INSERT INTO store_settings (key, value)
          VALUES (${key}, ${val})
          ON CONFLICT (key) DO UPDATE SET value = ${val}
        `;
      }
      const freshRows = await sql`SELECT * FROM store_settings` as unknown as { key: string, value: string }[];
      const freshSettings: Record<string, string> = {};
      freshRows.forEach(row => {
        freshSettings[row.key] = row.value;
      });
      return { ...defaultStoreSettings, ...freshSettings };
    } catch (e) {
      console.error('Error migrating store settings:', e);
    }
  }

  return { ...defaultStoreSettings, ...settings };
}
