import { sql } from './db';
import { getProducts, Product } from './products';

export interface CollectionItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  show_in_slider?: boolean;
  slider_subtitle?: string;
}

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

export async function getAllCollections(): Promise<CollectionItem[]> {
  try {
    const rows = await sql`
      SELECT * FROM collections 
      ORDER BY id ASC
    ` as unknown as CollectionItem[];

    if (rows && rows.length > 0) {
      return rows.map(coll => {
        let imageUrl = coll.image_url;
        if (!imageUrl || imageUrl.trim() === '') {
          const lowerName = coll.name.toLowerCase();
          if (lowerName.includes('ring')) {
            imageUrl = '/images/rings_category.png';
          } else if (lowerName.includes('necklace') || lowerName.includes('choker') || lowerName.includes('pendant')) {
            imageUrl = '/images/necklaces_category.png';
          } else if (lowerName.includes('earring') || lowerName.includes('jhumka') || lowerName.includes('stud') || lowerName.includes('hoop')) {
            imageUrl = '/images/earrings_category.png';
          } else if (lowerName.includes('bracelet') || lowerName.includes('bangle') || lowerName.includes('cuff')) {
            imageUrl = '/images/bracelets_category.png';
          } else if (lowerName.includes('charm')) {
            imageUrl = '/images/charm_category.png';
          } else if (lowerName.includes('silver')) {
            imageUrl = '/images/hero_slide_1.png';
          } else if (lowerName.includes('gold') || lowerName.includes('royal')) {
            imageUrl = '/images/hero_slide_2.png';
          } else {
            imageUrl = '/images/category_banner_jewelry.png';
          }
        }
        return {
          ...coll,
          image_url: imageUrl
        };
      });
    }
  } catch (err) {
    console.error('Error fetching all collections from DB:', err);
  }

  return [
    {
      id: 1,
      name: 'Rings',
      slug: 'rings',
      description: 'Aesthetic and premium daily rings, statement rings, and adjustable bands.',
      image_url: '/images/rings_category.png'
    },
    {
      id: 2,
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Graceful necklaces, chokers, pendants, and layering chains.',
      image_url: '/images/necklaces_category.png'
    },
    {
      id: 3,
      name: 'Earrings',
      slug: 'earrings',
      description: 'Stunning earrings ranging from daily studs to elegant drops.',
      image_url: '/images/earrings_category.png'
    },
    {
      id: 4,
      name: 'Bracelets & Bangles',
      slug: 'bracelets',
      description: 'Dainty chains, gemstone cuffs, and statement wrist accessories.',
      image_url: '/images/bracelets_category.png'
    },
    {
      id: 5,
      name: 'Charms',
      slug: 'charms',
      description: 'Dainty clip-on charms for chains, bracelets, and bangles.',
      image_url: '/images/charm_category.png'
    },
    {
      id: 6,
      name: 'Sterling Silver',
      slug: 'sterling-silver',
      description: 'Genuine 925 sterling silver rings & jewelry crafted with sparkling cubic zirconia.',
      image_url: '/images/hero_slide_1.png'
    },
    {
      id: 7,
      name: '18k Gold Plated',
      slug: 'gold-plated',
      description: 'Luxurious warm gold finishes over sterling silver and brass.',
      image_url: '/images/hero_slide_2.png'
    },
    {
      id: 8,
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'The most popular and loved jewelry pieces chosen by our customers.',
      image_url: '/images/hero_slide_3.png'
    }
  ];
}
