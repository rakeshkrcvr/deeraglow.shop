import { sql } from './db';
import { getProducts, Product } from './products';

export interface SliderCollectionItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  show_in_slider: boolean;
  slider_subtitle: string;
  products: Product[];
}

export async function getSliderCollections(): Promise<SliderCollectionItem[]> {
  try {
    // 1. Ensure table exists with slider columns
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        image_url VARCHAR(255) DEFAULT '',
        show_in_slider BOOLEAN DEFAULT FALSE,
        slider_subtitle VARCHAR(255) DEFAULT ''
      )
    `;

    try {
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT ''`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_in_slider BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS slider_subtitle VARCHAR(255) DEFAULT ''`;
    } catch (e) {
      console.error('Migration check in getSliderCollections:', e);
    }

    const allProducts = await getProducts();

    // Query active slider collections
    const rows = await sql`
      SELECT * FROM collections 
      WHERE show_in_slider = true 
      ORDER BY id ASC
    ` as unknown as SliderCollectionItem[];

    if (rows && rows.length > 0) {
      return rows.map(coll => {
        const collProds = allProducts.filter(
          p => p.collection && p.collection.toLowerCase() === coll.name.toLowerCase()
        );
        return {
          ...coll,
          products: collProds.slice(0, 3)
        };
      });
    }
  } catch (err) {
    console.error('Error fetching slider collections from DB:', err);
  }

  // Fallback default slider collections matching the reference design
  const allProducts = await getProducts();
  const earrings = allProducts.filter(p => p.collection === 'Earrings');
  const rings = allProducts.filter(p => p.collection === 'Rings');
  const necklaces = allProducts.filter(p => p.collection === 'Necklaces');
  const bracelets = allProducts.filter(p => p.collection === 'Bracelets');

  return [
    {
      id: 901,
      name: 'Flow Tide',
      slug: 'flow-tide',
      description: 'Fluid gold contours and organic sterling silver forms.',
      image_url: '/images/hero_slide_1.png',
      show_in_slider: true,
      slider_subtitle: 'Jewels That Flow With You',
      products: earrings.length >= 3 ? earrings.slice(0, 3) : allProducts.slice(0, 3)
    },
    {
      id: 902,
      name: 'Kings & Queens of Rajasthan',
      slug: 'kings-queens-of-rajasthan',
      description: 'The legacy of royals, crafted in handcrafted jewels.',
      image_url: '/images/hero_slide_2.png',
      show_in_slider: true,
      slider_subtitle: 'The Legacy of Royals, Crafted in Jewels',
      products: necklaces.length >= 3 ? necklaces.slice(0, 3) : allProducts.slice(3, 6)
    },
    {
      id: 903,
      name: 'Navratan',
      slug: 'navratan',
      description: 'Nine vibrant shades of royalty woven into silver and gold.',
      image_url: '/images/hero_slide_3.png',
      show_in_slider: true,
      slider_subtitle: 'Celebrate Every Shade of Royalty',
      products: rings.length >= 3 ? rings.slice(0, 3) : allProducts.slice(6, 9)
    },
    {
      id: 904,
      name: 'Aura Sterling',
      slug: 'aura-sterling',
      description: 'Radiant 925 sterling silver statement pieces.',
      image_url: '/images/category_banner_jewelry.png',
      show_in_slider: true,
      slider_subtitle: 'Luminous Elegance for Everyday',
      products: bracelets.length >= 3 ? bracelets.slice(0, 3) : allProducts.slice(2, 5)
    }
  ];
}
