import { sql } from './db';

type DatabaseError = Error & { code?: string };

export interface Product {
  id: number;
  name: string;
  slug: string;
  collection: string;
  price: number;
  rating: number;
  reviews_count: number;
  description: string;
  image_url: string;
  features: string;
  
  // Customizable template fields
  tagline?: string;
  fragrances?: string;
  dimensions?: string;
  weight?: string;
  burn_hours?: string;
  acc_burn_time?: string;
  acc_ingredients?: string;
  acc_instructions?: string;
  acc_shipping?: string;
  images?: string;
  deleted_at?: string | null;
}

export async function getProducts(options: { includeDeleted?: boolean } = {}): Promise<Product[]> {
  try {
    // 1. Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        collection VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        rating DECIMAL(3, 1) NOT NULL,
        reviews_count INT NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        features VARCHAR(255) NOT NULL,
        
        tagline VARCHAR(500) DEFAULT '100% tarnish-free — 925 sterling silver — premium cubic zirconia',
        fragrances VARCHAR(500) DEFAULT '925 Sterling Silver, Gold Plated, Cubic Zirconia',
        dimensions VARCHAR(255) DEFAULT 'Adjustable Ring Size / Standard Size',
        weight VARCHAR(255) DEFAULT '15 gms',
        burn_hours VARCHAR(255) DEFAULT 'N/A',
        acc_burn_time TEXT DEFAULT 'Tarnish-free polish lifetime durability',
        acc_ingredients TEXT DEFAULT '925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine.',
        acc_instructions TEXT DEFAULT 'Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use.',
        acc_shipping TEXT DEFAULT 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewelry is completely unused and in its original packaging.',
        images TEXT DEFAULT '',
        deleted_at TIMESTAMPTZ DEFAULT NULL
      )
    `;

    // 2. Safely run schema migrations
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE`;
    } catch {}

    const migrations = ['tagline', 'fragrances', 'dimensions', 'weight', 'burn_hours', 'acc_burn_time', 'acc_ingredients', 'acc_instructions', 'acc_shipping', 'images', 'deleted_at'];
    for (const m of migrations) {
      try {
        if (m === 'tagline') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline VARCHAR(500) DEFAULT '100% tarnish-free — 925 sterling silver — premium cubic zirconia'`;
        if (m === 'fragrances') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fragrances VARCHAR(500) DEFAULT '925 Sterling Silver, Gold Plated, Cubic Zirconia'`;
        if (m === 'dimensions') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(255) DEFAULT 'Adjustable Ring Size / Standard Size'`;
        if (m === 'weight') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight VARCHAR(255) DEFAULT '15 gms'`;
        if (m === 'burn_hours') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS burn_hours VARCHAR(255) DEFAULT 'N/A'`;
        if (m === 'acc_burn_time') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_burn_time TEXT DEFAULT 'Tarnish-free polish lifetime durability'`;
        if (m === 'acc_ingredients') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_ingredients TEXT DEFAULT '925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine.'`;
        if (m === 'acc_instructions') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_instructions TEXT DEFAULT 'Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use.'`;
        if (m === 'acc_shipping') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_shipping TEXT DEFAULT 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewelry is completely unused and in its original packaging.'`;
        if (m === 'images') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT DEFAULT ''`;
        if (m === 'deleted_at') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL`;
      } catch (e) {
        console.error('Migration error for ' + m + ':', e);
      }
    }

    // 3. Query all products so deleted seeded items are not recreated.
    try {
      await sql`
        DELETE FROM products 
        WHERE collection ILIKE '%candle%' 
           OR collection ILIKE '%wax%' 
           OR description ILIKE '%aroma%' 
           OR description ILIKE '%wax%'
           OR description ILIKE '%scents%'
           OR description ILIKE '%wick%'
           OR name ILIKE '%candle%'
           OR name ILIKE '%sacred ritual%'
           OR name ILIKE '%oud%'
      `;
    } catch (err) {
      console.error('Error clearing old candle products:', err);
    }

    let allProducts = await sql`SELECT * FROM products ORDER BY id ASC` as unknown as Product[];

    // 4. Define all standard products with their unique SEO slugs
    const initialProducts = [
      {
        name: "Royal Pearl Drops",
        slug: "royal-pearl-drops",
        collection: "Earrings",
        price: 899,
        rating: 4.9,
        reviews_count: 124,
        description: "Elegant double-layered drops with premium faux pearls and shimmering crystal settings.",
        image_url: "/images/earrings_category.png",
        features: "Pearl • Drop • Gold Plated"
      },
      {
        name: "Golden Solitaire Ring",
        slug: "golden-solitaire-ring",
        collection: "Rings",
        price: 1199,
        rating: 4.9,
        reviews_count: 88,
        description: "A classic 925 sterling silver ring featuring a sparkling central cubic zirconia stone.",
        image_url: "/images/rings_category.png",
        features: "Solitaire • 925 Silver • Cubic Zirconia"
      },
      {
        name: "Classic Heart Pendant",
        slug: "classic-heart-pendant",
        collection: "Necklaces",
        price: 799,
        rating: 4.8,
        reviews_count: 62,
        description: "A delicate gold-plated chain with a polished heart-shaped pendant, perfect for daily layering.",
        image_url: "/images/necklaces_category.png",
        features: "Heart • Pendant • Layering Chain"
      },
      {
        name: "Minimalist Link Chain",
        slug: "minimalist-link-chain",
        collection: "Bracelets",
        price: 699,
        rating: 4.7,
        reviews_count: 45,
        description: "An elegant, lightweight link bracelet crafted with gold-plated brass and adjustable clasp.",
        image_url: "/images/bracelets_category.png",
        features: "Link Chain • Gold Plated • Adjustable"
      },
      {
        name: "Emperor Crown Charm",
        slug: "emperor-crown-charm",
        collection: "Charms",
        price: 499,
        rating: 4.8,
        reviews_count: 36,
        description: "A beautifully detailed miniature crown charm in sterling silver to add to your favorite carrier.",
        image_url: "/images/charm_category.png",
        features: "Crown • Sterling Silver • Charm Carrier"
      },
      {
        name: "Dazzling Double Hoops",
        slug: "dazzling-double-hoops",
        collection: "Earrings",
        price: 949,
        rating: 4.9,
        reviews_count: 52,
        description: "Modern interlocking double-hoop earrings in gold plating with micro-paved cubic zirconia.",
        image_url: "/images/earrings_category.png",
        features: "Double Hoop • Micro-Pave • Gold Plated"
      },
      {
        name: "Eternity Band Ring",
        slug: "eternity-band-ring",
        collection: "Rings",
        price: 1299,
        rating: 4.9,
        reviews_count: 73,
        description: "A full eternity band set with round-cut premium cubic zirconia stones for timeless shine.",
        image_url: "/images/rings_category.png",
        features: "Eternity Band • Full Setting • 925 Silver"
      },
      {
        name: "Infinity Loop Necklace",
        slug: "infinity-loop-necklace",
        collection: "Necklaces",
        price: 849,
        rating: 4.8,
        reviews_count: 58,
        description: "A symbolic infinity loop necklace with delicate crystal accents, signifying infinite beauty.",
        image_url: "/images/necklaces_category.png",
        features: "Infinity Loop • Crystals • Silver Chain"
      },
      {
        name: "Tennis Gemstone Bracelet",
        slug: "tennis-gemstone-bracelet",
        collection: "Bracelets",
        price: 1499,
        rating: 4.9,
        reviews_count: 90,
        description: "A luxurious tennis bracelet lined with sparkling brilliant-cut cubic zirconia crystals.",
        image_url: "/images/bracelets_category.png",
        features: "Tennis • Zirconia Crystals • Luxury Box"
      },
      {
        name: "Rose Gold Floral Studs",
        slug: "rose-gold-floral-studs",
        collection: "Earrings",
        price: 799,
        rating: 4.8,
        reviews_count: 42,
        description: "Dainty flower-shaped stud earrings in warm rose gold plating with a crystal center.",
        image_url: "/images/earrings_category.png",
        features: "Floral Studs • Rose Gold • Crystal Center"
      },
      {
        name: "Vintage Emerald Ring",
        slug: "vintage-emerald-ring",
        collection: "Rings",
        price: 1599,
        rating: 4.9,
        reviews_count: 31,
        description: "An antique-inspired statement ring featuring a deep green oval-cut emerald glass center.",
        image_url: "/images/rings_category.png",
        features: "Vintage • Emerald Glass • Halo Crystals"
      },
      {
        name: "Layered Paperclip Choker",
        slug: "layered-paperclip-choker",
        collection: "Necklaces",
        price: 999,
        rating: 4.7,
        reviews_count: 24,
        description: "A trendy multi-layered paperclip chain choker in high-polish gold plating.",
        image_url: "/images/necklaces_category.png",
        features: "Paperclip Chain • Layered Choker • Gold Plated"
      },
      {
        name: "Charm Carrier Bangle",
        slug: "charm-carrier-bangle",
        collection: "Bracelets",
        price: 1199,
        rating: 4.8,
        reviews_count: 18,
        description: "A sleek sterling silver bangle with a safe threaded clasp to securely carry your favorite charms.",
        image_url: "/images/bracelets_category.png",
        features: "Carrier Bangle • Sterling Silver • Threaded Clasp"
      },
      {
        name: "Sparkling Hoop Huggies",
        slug: "sparkling-hoop-huggies",
        collection: "Earrings",
        price: 699,
        rating: 4.7,
        reviews_count: 35,
        description: "Minimalist crystal-lined huggie hoop earrings, perfect for everyday styling and layering.",
        image_url: "/images/earrings_category.png",
        features: "Huggies • Hoop Earrings • Crystal Channel"
      },
      {
        name: "Adjustable Promise Ring",
        slug: "adjustable-promise-ring",
        collection: "Rings",
        price: 899,
        rating: 4.8,
        reviews_count: 29,
        description: "An adjustable-size sterling silver promise ring with twin interlocking cubic zirconia bands.",
        image_url: "/images/rings_category.png",
        features: "Promise Ring • Adjustable • Interlocking Bands"
      }
    ];

    // Seed missing products or update missing slugs
    let needsRequery = false;
    for (const prod of initialProducts) {
      const dbProdByName = allProducts.find(p => p.name === prod.name);
      const dbProdBySlug = allProducts.find(p => p.slug === prod.slug);

      if (!dbProdByName && !dbProdBySlug) {
        console.log(`Seeding missing product: ${prod.name}`);
        try {
          await sql`
            INSERT INTO products (name, slug, collection, price, rating, reviews_count, description, image_url, features)
            VALUES (${prod.name}, ${prod.slug}, ${prod.collection}, ${prod.price}, ${prod.rating}, ${prod.reviews_count}, ${prod.description}, ${prod.image_url}, ${prod.features})
          `;
          needsRequery = true;
        } catch (e: unknown) {
          const error = e as DatabaseError;
          if (error.code === '23505') {
            console.log(`Seeding: Product ${prod.name} already inserted by concurrent worker.`);
          } else {
            console.error(`Seeding failed for ${prod.name}:`, error);
          }
        }
      } else if (dbProdByName) {
        const isStale = 
          dbProdByName.image_url !== prod.image_url || 
          dbProdByName.slug !== prod.slug || 
          (dbProdByName.tagline && dbProdByName.tagline.includes('wax')) ||
          (dbProdByName.acc_ingredients && dbProdByName.acc_ingredients.includes('wax'));

        if (isStale) {
          console.log(`Updating image_url, slug and default fields for product: ${prod.name}`);
          try {
            await sql`
              UPDATE products 
              SET 
                slug = ${prod.slug}, 
                image_url = ${prod.image_url},
                tagline = '100% tarnish-free — 925 sterling silver — premium cubic zirconia',
                fragrances = '925 Sterling Silver, Gold Plated, Cubic Zirconia',
                dimensions = 'Adjustable Ring Size / Standard Size',
                weight = '15 gms',
                burn_hours = 'N/A',
                acc_burn_time = 'Tarnish-free polish lifetime durability',
                acc_ingredients = '925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine.',
                acc_instructions = 'Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use.',
                acc_shipping = 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewelry is completely unused and in its original packaging.'
              WHERE id = ${dbProdByName.id}
            `;
            needsRequery = true;
          } catch (e: unknown) {
            console.error(`Failed to update product ${prod.name}:`, e);
          }
        }
      }
    }

    if (needsRequery) {
      allProducts = await sql`SELECT * FROM products ORDER BY id ASC` as unknown as Product[];
    }

    if (options.includeDeleted) {
      return allProducts;
    }

    return allProducts.filter(product => !product.deleted_at);
  } catch (error) {
    console.error("Error in getProducts db transaction:", error);
    return [];
  }
}
