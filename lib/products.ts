import { sql } from './db';

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
}

export async function getProducts(): Promise<Product[]> {
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
        
        tagline VARCHAR(500) DEFAULT '100% natural soy wax — wooden wick — 30-40 hours burn time',
        fragrances VARCHAR(500) DEFAULT 'Oud, Jasmin, Rose, Vanilla',
        dimensions VARCHAR(255) DEFAULT 'W: 2.5 inch x H: 3 inch',
        weight VARCHAR(255) DEFAULT '350 gms',
        burn_hours VARCHAR(255) DEFAULT '32 Hrs',
        acc_burn_time TEXT DEFAULT '32 Hours average',
        acc_ingredients TEXT DEFAULT '100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.',
        acc_instructions TEXT DEFAULT 'Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.',
        acc_shipping TEXT DEFAULT 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.',
        images TEXT DEFAULT ''
      )
    `;

    // 2. Safely run schema migrations
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE`;
    } catch (e) {}

    const migrations = ['tagline', 'fragrances', 'dimensions', 'weight', 'burn_hours', 'acc_burn_time', 'acc_ingredients', 'acc_instructions', 'acc_shipping', 'images'];
    for (const m of migrations) {
      try {
        if (m === 'tagline') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline VARCHAR(500) DEFAULT '100% natural soy wax — wooden wick — 30-40 hours burn time'`;
        if (m === 'fragrances') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fragrances VARCHAR(500) DEFAULT 'Oud, Jasmin, Rose, Vanilla'`;
        if (m === 'dimensions') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(255) DEFAULT 'W: 2.5 inch x H: 3 inch'`;
        if (m === 'weight') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight VARCHAR(255) DEFAULT '350 gms'`;
        if (m === 'burn_hours') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS burn_hours VARCHAR(255) DEFAULT '32 Hrs'`;
        if (m === 'acc_burn_time') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_burn_time TEXT DEFAULT '32 Hours average'`;
        if (m === 'acc_ingredients') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_ingredients TEXT DEFAULT '100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.'`;
        if (m === 'acc_instructions') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_instructions TEXT DEFAULT 'Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.'`;
        if (m === 'acc_shipping') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS acc_shipping TEXT DEFAULT 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.'`;
        if (m === 'images') await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT DEFAULT ''`;
      } catch (e) {
        console.error('Migration error for ' + m + ':', e);
      }
    }

    // 3. Query products
    let products = await sql`SELECT * FROM products ORDER BY id ASC` as unknown as Product[];

    // 4. Define all standard products with their unique SEO slugs
    const initialProducts = [
      {
        name: "Sandalwood Sacred Ritual",
        slug: "sandalwood-sacred-ritual",
        collection: "Scented Candles",
        price: 899,
        rating: 4.9,
        reviews_count: 124,
        description: "A deep, grounding aroma featuring raw Indian Mysore sandalwood, incense smoke, and dried jasmine blossoms.",
        image_url: "/images/hero_candle.png",
        features: "Sandalwood • Incense • Jasmine"
      },
      {
        name: "Lavender & Midnight Oud",
        slug: "lavender-midnight-oud",
        collection: "Soy Wax Candles",
        price: 849,
        rating: 4.8,
        reviews_count: 88,
        description: "A calming therapeutic blend of English lavender, dark agarwood (oud), and amber resin for deep sleep.",
        image_url: "/images/lavender_candle.png",
        features: "Lavender • Oud • Amber"
      },
      {
        name: "Jasmine & Crushed Mint",
        slug: "jasmine-crushed-mint",
        collection: "Jar Candles",
        price: 799,
        rating: 4.7,
        reviews_count: 62,
        description: "A fresh, cooling combination of blooming night jasmine and wild crushed mint leaves, perfect for focus.",
        image_url: "/images/jasmine_candle.png",
        features: "Jasmine • Fresh Mint • Green Tea"
      },
      {
        name: "Eucalyptus & Silver Cedar",
        slug: "eucalyptus-silver-cedar",
        collection: "Luxury Candles",
        price: 949,
        rating: 4.9,
        reviews_count: 73,
        description: "A fresh, clearing aura blend of fresh eucalyptus leaves, silver cedarwood, and wild forest moss.",
        image_url: "/images/eucalyptus_candle.png",
        features: "Eucalyptus • Cedarwood • Forest Moss"
      },
      {
        name: "Amber Vanilla & Warm Tobacco",
        slug: "amber-vanilla-warm-tobacco",
        collection: "Decorative Candles",
        price: 999,
        rating: 4.8,
        reviews_count: 95,
        description: "A cozy, warm aura blend of sweet vanilla bean extract, aged bourbon, and tobacco leaf essence.",
        image_url: "/images/vanilla_candle.png",
        features: "Vanilla Bourbon • Sweet Amber • Tobacco"
      },
      {
        name: "Rose & Himalayan Oud",
        slug: "rose-himalayan-oud",
        collection: "Scented Candles",
        price: 949,
        rating: 4.7,
        reviews_count: 54,
        description: "A devotive aura blend of pink rose blossoms, Himalayan agarwood (oud), and warm sandalwood.",
        image_url: "/images/rose_candle.png",
        features: "Pink Rose • Dark Oud • Mysore Sandalwood"
      },
      {
        name: "Vanilla & Spiced Cocoa",
        slug: "vanilla-spiced-cocoa",
        collection: "Scented Candles",
        price: 849,
        rating: 4.8,
        reviews_count: 36,
        description: "A decadent holiday blend of warm vanilla extract, dark spiced cocoa, and cinnamon bark.",
        image_url: "/images/vanilla_candle.png",
        features: "Vanilla • Cocoa • Cinnamon"
      },
      {
        name: "Lavender Sleep Infusion",
        slug: "lavender-sleep-infusion",
        collection: "Soy Wax Candles",
        price: 799,
        rating: 4.9,
        reviews_count: 42,
        description: "A calming herbal candle designed for sleep therapies, featuring French lavender, chamomile, and valerian roots.",
        image_url: "/images/lavender_candle.png",
        features: "Lavender • Chamomile • Valerian"
      },
      {
        name: "Golden Amber & Sandalwood",
        slug: "golden-amber-sandalwood",
        collection: "Luxury Candles",
        price: 1199,
        rating: 4.9,
        reviews_count: 55,
        description: "A luxurious aroma combining heavy golden amber resin, cedar shavings, and Indian sandalwood extract.",
        image_url: "/images/hero_candle.png",
        features: "Amber • Sandalwood • Cedarwood"
      },
      {
        name: "Fresh Mint & Lime Citrus",
        slug: "fresh-mint-lime-citrus",
        collection: "Decorative Candles",
        price: 849,
        rating: 4.6,
        reviews_count: 24,
        description: "A bright and zesty decorative kitchen candle featuring fresh lime peels, key lime oil, and wild spearmint.",
        image_url: "/images/eucalyptus_candle.png",
        features: "Lime • Spearmint • Lemon"
      },
      {
        name: "Coffee Bean & Caramel Swirl",
        slug: "coffee-bean-caramel",
        collection: "Jar Candles",
        price: 899,
        rating: 4.8,
        reviews_count: 67,
        description: "An invigorating coffeehouse scent featuring roasted arabica coffee beans, salted caramel drizzle, and steamed milk.",
        image_url: "/images/hero_candle.png",
        features: "Coffee • Caramel • Warm Milk"
      },
      {
        name: "Wild Rose & Patchouli",
        slug: "wild-rose-patchouli",
        collection: "Scented Candles",
        price: 949,
        rating: 4.7,
        reviews_count: 31,
        description: "A sensuous woody floral blend combining organic rose buds, aged patchouli leaves, and amber dust.",
        image_url: "/images/rose_candle.png",
        features: "Rose • Patchouli • Vanilla"
      },
      {
        name: "Ocean Breeze & Salted Sage",
        slug: "ocean-breeze-sage",
        collection: "Soy Wax Candles",
        price: 899,
        rating: 4.8,
        reviews_count: 48,
        description: "A refreshing marine scent evoking windswept coastlines, featuring sea salt sprays, dry sage leaves, and vetiver.",
        image_url: "/images/eucalyptus_candle.png",
        features: "Sea Salt • Sage • Vetiver"
      },
      {
        name: "Smoked Oud & Amber Resin",
        slug: "smoked-oud-amber",
        collection: "Luxury Candles",
        price: 1249,
        rating: 4.9,
        reviews_count: 90,
        description: "An opulent, heavy resinous blend featuring smoked agarwood logs, warm Baltic amber, and aromatic myrrh gums.",
        image_url: "/images/lavender_candle.png",
        features: "Smoked Oud • Amber • Myrrh"
      },
      {
        name: "Sweet Orange & Lavender",
        slug: "sweet-orange-lavender",
        collection: "Mini Candles",
        price: 499,
        rating: 4.7,
        reviews_count: 15,
        description: "A travel-friendly mini tin balancing bright citrus notes of sweet blood orange with relaxing lavender blooms.",
        image_url: "/images/vanilla_candle.png",
        features: "Orange • Lavender • Vanilla"
      }
    ];

    // Seed missing products or update missing slugs
    let needsRequery = false;
    for (const prod of initialProducts) {
      const dbProdByName = products.find(p => p.name === prod.name);
      const dbProdBySlug = products.find(p => p.slug === prod.slug);

      if (!dbProdByName && !dbProdBySlug) {
        console.log(`Seeding missing product: ${prod.name}`);
        try {
          await sql`
            INSERT INTO products (name, slug, collection, price, rating, reviews_count, description, image_url, features)
            VALUES (${prod.name}, ${prod.slug}, ${prod.collection}, ${prod.price}, ${prod.rating}, ${prod.reviews_count}, ${prod.description}, ${prod.image_url}, ${prod.features})
          `;
          needsRequery = true;
        } catch (e: any) {
          if (e.code === '23505') {
            console.log(`Seeding: Product ${prod.name} already inserted by concurrent worker.`);
          } else {
            console.error(`Seeding failed for ${prod.name}:`, e);
          }
        }
      } else if (dbProdByName && !dbProdByName.slug) {
        console.log(`Updating missing slug for product: ${prod.name}`);
        try {
          await sql`
            UPDATE products SET slug = ${prod.slug} WHERE id = ${dbProdByName.id}
          `;
          needsRequery = true;
        } catch (e: any) {
          if (e.code !== '23505') {
            console.error(e);
          }
        }
      }
    }

    if (needsRequery) {
      products = await sql`SELECT * FROM products ORDER BY id ASC` as unknown as Product[];
    }

    return products;
  } catch (error) {
    console.error("Error in getProducts db transaction:", error);
    return [];
  }
}
