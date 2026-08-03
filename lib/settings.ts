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
  metaCatalogId: '1854976142149958',
  metaBusinessId: '534361075958208',
  metaAccessToken: '',
  metaAppId: '',
  metaAutoSyncEnabled: 'true',
  instagramUrl: 'https://www.instagram.com/deeraglowshop/',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61592384944285',
  pinterestUrl: 'https://in.pinterest.com/deekshadeeraglow/',
  twitterUrl: '',
  youtubeUrl: 'https://www.youtube.com/@DeeraGlow',
  logoHeaderUrl: '/api/media/1784834143580-991fe81e-0ee7-4dfd-a9f3-4ebf7f064265-logowhite.png',
  logoFooterUrl: '/api/media/1784834143580-991fe81e-0ee7-4dfd-a9f3-4ebf7f064265-logowhite.png',
  faviconUrl: '/api/media/1784834143580-991fe81e-0ee7-4dfd-a9f3-4ebf7f064265-logowhite.png',
  heroEyebrow: 'TIMELESS BEAUTY',
  heroTitle: 'Shine Brighter',
  heroItalicTitle: 'Every Day',
  heroDescription: 'Discover exquisite jewellery that celebrates your unique style and every special moment.',
  heroPrimaryButtonText: 'Shop Collection',
  heroPrimaryButtonHref: '#shop-by-collection',
  heroSecondaryButtonText: 'New Arrivals',
  heroSecondaryButtonHref: '#products',
  heroFloatingTag: '925 Sterling Silver',
  heroSliderImages: '["/images/hero_slide_1.png", "/images/hero_slide_2.png", "/images/hero_slide_3.png"]',
  contentBlogPosts: '[{"id":1,"title":"How to Style Minimalist Gold jewellery","author":"Deera Sharma","date":"Jul 2, 2026","status":"Published"},{"id":2,"title":"The Ultimate Guide to Stacking Rings","author":"Deera Sharma","date":"Jun 28, 2026","status":"Published"},{"id":3,"title":"Why 925 Sterling Silver is Perfect for Daily Wear","author":"Rohan Sen","date":"Jun 24, 2026","status":"Published"}]',
  contentNavigationMenus: '[{"id":1,"menu":"Main Menu","links":"Home - Shop - Rings - Necklaces - About Us - Blogs"},{"id":2,"menu":"Footer Collection List","links":"Rings - Bracelets - Necklaces - Earrings"},{"id":3,"menu":"Footer Scent Categories","links":"Gold Plated - Sterling Silver - Charms - Best Sellers"}]',
  contentCategoryGrid: '[{"id":"rings","title":"SHOP RINGS","link":"/category/rings","image":"/images/rings_category.png"},{"id":"bracelets","title":"SHOP BRACELETS","link":"/category/bracelets","image":"/images/bracelets_category.png"},{"id":"necklaces","title":"SHOP NECKLACES","link":"/category/necklaces","image":"/images/necklaces_category.png"},{"id":"earrings","title":"SHOP EARRINGS","link":"/category/earrings","image":"/images/earrings_category.png"},{"id":"charm","title":"SHOP CHARM","link":"/category/charms","image":"/images/charm_category.png"}]',
  contentPromoBannerImage: '/images/category_banner_jewelry.png',
  contentPromoBannerLink: '/category/necklaces',
  contentPromoBanner2Image: '/images/jewellery_category_banner.png',
  contentPromoBanner2Link: '/category/earrings',
  contentBeforeAfterImage: 'https://www.deeraglow.shop/api/media/1785230756833-5ea86cd4-49f2-4af1-bdbe-81ebcc3460cc-afterbefore.png',
  heroAnnouncementItems: '[{"id":"1","text":"Buy 2 Get 2 Free","icon":"gift","link":"/collections"},{"id":"2","text":"100% Secure Checkout","icon":"shield","link":""},{"id":"3","text":"Premium Fine jewellery","icon":"star","link":""}]',
  freeShippingThreshold: '500',
  standardDeliveryCharge: '190',
  codHandlingFee: '150',
  codAdvanceAmount: '200',
  codNoticeText: 'To confirm your Cash on Delivery order, you must pay a non-refundable advance online. The remaining amount will be collected at the time of delivery.'
};

export async function ensureStoreSettingsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;
  } catch (e) {
    console.error('Error ensuring store_settings table:', e);
  }
}

export async function getStoreSettings(): Promise<Record<string, string>> {
  try {
    await ensureStoreSettingsTable();

    const rows = await sql`SELECT * FROM store_settings` as unknown as { key: string, value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Populate defaults only if settings table is empty
    if (rows.length === 0) {
      try {
        for (const [key, val] of Object.entries(defaultStoreSettings)) {
          await sql`
            INSERT INTO store_settings (key, value)
            VALUES (${key}, ${val})
            ON CONFLICT (key) DO UPDATE SET value = ${val}
          `;
        }
      } catch (e) {
        console.error('Error populating initial store settings:', e);
      }
    }

    const mergedSettings = { ...defaultStoreSettings, ...settings };

    // Guarantee essential image URLs are never empty
    if (!mergedSettings.logoHeaderUrl || mergedSettings.logoHeaderUrl.trim() === '') {
      mergedSettings.logoHeaderUrl = defaultStoreSettings.logoHeaderUrl;
    }
    if (!mergedSettings.logoFooterUrl || mergedSettings.logoFooterUrl.trim() === '') {
      mergedSettings.logoFooterUrl = defaultStoreSettings.logoFooterUrl;
    }
    if (!mergedSettings.faviconUrl || mergedSettings.faviconUrl.trim() === '') {
      mergedSettings.faviconUrl = mergedSettings.logoHeaderUrl || defaultStoreSettings.faviconUrl;
    }
    if (!mergedSettings.contentPromoBannerImage || mergedSettings.contentPromoBannerImage.trim() === '') {
      mergedSettings.contentPromoBannerImage = defaultStoreSettings.contentPromoBannerImage;
    }
    if (!mergedSettings.contentPromoBanner2Image || mergedSettings.contentPromoBanner2Image.trim() === '') {
      mergedSettings.contentPromoBanner2Image = defaultStoreSettings.contentPromoBanner2Image;
    }

    return mergedSettings;
  } catch (err) {
    console.error('Error in getStoreSettings DB call, using defaultStoreSettings:', err);
    return defaultStoreSettings;
  }
}
