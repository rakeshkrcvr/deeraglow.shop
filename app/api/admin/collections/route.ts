import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import { ensureProductCollectionsTable, setCollectionProducts } from '@/lib/productCollections';

type CountRow = { count: string };
type CollectionNameRow = { name: string };

// A collection assignment changes the products displayed on the storefront as
// well as the homepage slider, so invalidate every page that reads that data.
function revalidateCollectionStorefront() {
  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
}

export async function GET() {
  try {
    // 1. Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE
      )
    `;

    // 1b. Schema migrations for slider columns
    try {
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT ''`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_in_slider BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS slider_subtitle VARCHAR(255) DEFAULT ''`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS thumb_image_1 VARCHAR(255) DEFAULT ''`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS thumb_image_2 VARCHAR(255) DEFAULT ''`;
      await sql`ALTER TABLE collections ADD COLUMN IF NOT EXISTS thumb_image_3 VARCHAR(255) DEFAULT ''`;
    } catch (e) {
      console.error('Migration error for collections columns:', e);
    }

    // Check if table is empty, seed initial collections only if 0 exist
    const existingCollections = await sql`SELECT name FROM collections` as unknown as CollectionNameRow[];

    // Default collections are an optional one-time development seed. They must
    // never be recreated automatically after an admin deletes them.
    if (existingCollections.length === 0 && process.env.SEED_DEFAULT_COLLECTIONS === 'true') {
      const seedCollections = [
        // 1. Rings
        { name: 'Rings', desc: 'Aesthetic and premium daily rings, statement rings, and adjustable bands.', slug: 'rings' },
        { name: 'Sterling Silver Rings', desc: 'Genuine 925 sterling silver rings crafted with sparkling cubic zirconia.', slug: 'sterling-silver-rings' },
        { name: 'Gold Plated Rings', desc: '18k gold-plated brass rings for a warm, luxurious glow.', slug: 'gold-plated-rings' },
        { name: 'Solitaire Rings', desc: 'Elegant single-stone rings for engagements, anniversaries, or statement wear.', slug: 'solitaire-rings' },
        { name: 'Adjustable Rings', desc: 'Free-size rings designed to fit any finger perfectly and comfortably.', slug: 'adjustable-rings' },
        { name: 'Eternity Bands', desc: 'Continuous shimmering crystals representing eternal love and elegance.', slug: 'eternity-bands' },
        { name: 'Vintage Rings', desc: 'Antique-inspired statement pieces featuring emeralds, sapphires, and intricate details.', slug: 'vintage-rings' },

        // 2. Necklaces
        { name: 'Necklaces', desc: 'Graceful necklaces, chokers, pendants, and layering chains.', slug: 'necklaces' },
        { name: 'Choker Necklaces', desc: 'Snug-fitting statement chokers to complement any neckline.', slug: 'choker-necklaces' },
        { name: 'Pendant Necklaces', desc: 'Timeless pendants featuring hearts, infinity loops, and celestial charms.', slug: 'pendant-necklaces' },
        { name: 'Layered Necklaces', desc: 'Pre-stacked multi-layered chains for an effortless, trendy look.', slug: 'layered-necklaces' },
        { name: 'Pearl Necklaces', desc: 'Lustrous premium faux pearls for a classic, sophisticated aesthetic.', slug: 'pearl-necklaces' },
        { name: 'Chain Necklaces', desc: 'Sleek minimalist chains perfect for daily wear or adding custom charms.', slug: 'chain-necklaces' },

        // 3. Earrings
        { name: 'Earrings', desc: 'Stunning earrings ranging from daily studs to elegant drops.', slug: 'earrings' },
        { name: 'Stud Earrings', desc: 'Minimalist and comfortable studs for daily elegance.', slug: 'stud-earrings' },
        { name: 'Hoop Earrings', desc: 'Classic hoops and huggies that frame your face with shimmering light.', slug: 'hoop-earrings' },
        { name: 'Drop Earrings', desc: 'Elegant statement drops and danglers perfect for parties and weddings.', slug: 'drop-earrings' },
        { name: 'Pearl Earrings', desc: 'Charming pearl accents that bring a touch of class to any outfit.', slug: 'pearl-earrings' },
        { name: 'Chandeliers & Jhumkas', desc: 'Ornate traditional-modern fusion danglers for festive celebrations.', slug: 'chandeliers-jhumkas' },

        // 4. Bracelets & Bangles
        { name: 'Bracelets', desc: 'Dainty chains, gemstone cuffs, and statement wrist accessories.', slug: 'bracelets' },
        { name: 'Bangles', desc: 'Traditional and modern wrist bands for a complete, structured look.', slug: 'bangles' },
        { name: 'Charm Bracelets', desc: 'Customizable chains with cute, meaningful charms.', slug: 'charm-bracelets' },
        { name: 'Tennis Bracelets', desc: 'A continuous line of brilliant cubic zirconia for high-end luxury.', slug: 'tennis-bracelets' },
        { name: 'Cuff Bracelets', desc: 'Open-ended statement cuffs that adjust to your wrist shape.', slug: 'cuff-bracelets' },

        // 5. Accessories & Materials
        { name: 'Charms', desc: 'Dainty clip-on charms for chains, bracelets, and bangles.', slug: 'charms' },
        { name: '925 Sterling Silver', desc: 'Anti-tarnish, hypoallergenic premium silver jewellery.', slug: 'sterling-silver' },
        { name: '18k Gold Plated', desc: 'Luxurious warm gold finishes over sterling silver and brass.', slug: 'gold-plated' },
        { name: 'Rose Gold jewellery', desc: 'Romantic and modern pink-gold plated accessories.', slug: 'rose-gold' },
        { name: 'Gemstone jewellery', desc: 'Adorned with high-quality emeralds, rubies, and premium crystals.', slug: 'gemstone-jewellery' },

        // 6. Occasions & Gifting
        { name: 'Birthday Gifts', desc: 'Make their birthday memorable with personalized jewellery gifts.', slug: 'birthday-gifts' },
        { name: 'Anniversary Gifts', desc: 'Celebrate beautiful milestones with timeless rings and necklaces.', slug: 'anniversary-gifts' },
        { name: 'Wedding jewellery', desc: 'Bridal and bridesmaid statement collections that shine.', slug: 'wedding-jewellery' },
        { name: 'Festive Collection', desc: 'Shining jewellery perfect for Diwali, Eid, and family celebrations.', slug: 'festive-collection' },
        { name: 'Daily Wear', desc: 'Hypoallergenic, lightweight pieces comfortable for long daily hours.', slug: 'daily-wear' },
        { name: 'Office Wear', desc: 'Sleek, professional, and subtle accessories for the workplace.', slug: 'office-wear' },
        { name: 'Party Wear', desc: 'Bold, eye-catching jewellery designed to steal the spotlight.', slug: 'party-wear' },
        { name: 'Valentine\'s Day', desc: 'Romantic heart pendants and promise rings for your loved one.', slug: 'valentines-day' },

        // 7. Curations
        { name: 'Best Sellers', desc: 'The most popular and loved jewellery pieces chosen by our customers.', slug: 'best-sellers' },
        { name: 'New Arrivals', desc: 'Freshly launched trend-setting designs for this season.', slug: 'new-arrivals' },
        { name: 'Gift Sets', desc: 'Beautifully boxed matching necklace and earring combinations.', slug: 'gift-sets' }
      ];

      for (const coll of seedCollections) {
        await sql`
          INSERT INTO collections (name, description, slug)
          VALUES (${coll.name}, ${coll.desc}, ${coll.slug})
          ON CONFLICT (name) DO NOTHING
        `;
      }
    }

    // Optional one-time development seed for the original slider collections.
    // Keeping this opt-in prevents deleted collections from returning on refresh.
    const defaultSliderColls = [
      { name: 'Flow Tide', desc: 'Fluid gold contours and organic sterling silver forms.', slug: 'flow-tide', image_url: '/images/hero_slide_1.png', slider_subtitle: 'Jewels That Flow With You', show_in_slider: true },
      { name: 'Kings & Queens of Rajasthan', desc: 'The legacy of royals, captured in exquisite jewels.', slug: 'kings-queens-of-rajasthan', image_url: '/images/hero_slide_2.png', slider_subtitle: 'The Legacy of Royals, Crafted in Jewels', show_in_slider: true },
      { name: 'Navratan', desc: 'Nine vibrant shades of royalty woven into silver and gold.', slug: 'navratan', image_url: '/images/hero_slide_3.png', slider_subtitle: 'Celebrate Every Shade of Royalty', show_in_slider: true },
      { name: 'Aura Sterling', desc: 'Radiant 925 sterling silver statement pieces.', slug: 'aura-sterling', image_url: '/images/category_banner_jewelry.png', slider_subtitle: 'Luminous Elegance for Everyday', show_in_slider: true }
    ];

    if (process.env.SEED_DEFAULT_COLLECTIONS === 'true') {
      for (const coll of defaultSliderColls) {
        await sql`
          INSERT INTO collections (name, description, slug, image_url, show_in_slider, slider_subtitle)
          VALUES (${coll.name}, ${coll.desc}, ${coll.slug}, ${coll.image_url}, ${coll.show_in_slider}, ${coll.slider_subtitle})
          ON CONFLICT (name) DO NOTHING
        `;
      }
    }

    const collections = await sql`SELECT * FROM collections ORDER BY id ASC`;
    await ensureProductCollectionsTable();
    return NextResponse.json(collections);
  } catch (error: unknown) {
    console.error('Error in collections GET:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, productIds, image_url, show_in_slider, slider_subtitle, thumb_image_1, thumb_image_2, thumb_image_3 } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Missing name or description' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const created = await sql`
      INSERT INTO collections (name, description, slug, image_url, show_in_slider, slider_subtitle, thumb_image_1, thumb_image_2, thumb_image_3)
      VALUES (${name}, ${description}, ${slug}, ${image_url || ''}, ${!!show_in_slider}, ${slider_subtitle || ''}, ${thumb_image_1 || ''}, ${thumb_image_2 || ''}, ${thumb_image_3 || ''})
      RETURNING id
    ` as unknown as { id: number }[];

    // Associate product ids if provided
    await setCollectionProducts(created[0].id, (Array.isArray(productIds) ? productIds : []).map(Number));

    revalidateCollectionStorefront();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections POST:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, productIds, image_url, show_in_slider, slider_subtitle, thumb_image_1, thumb_image_2, thumb_image_3 } = body;

    if (!id || !name || !description) {
      return NextResponse.json({ error: 'Missing ID, name or description' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Update collection details without changing a product's membership in any
    // other collection.
    await sql`
      UPDATE collections
      SET name = ${name}, 
          description = ${description}, 
          slug = ${slug},
          image_url = ${image_url || ''},
          show_in_slider = ${!!show_in_slider},
          slider_subtitle = ${slider_subtitle || ''},
          thumb_image_1 = ${thumb_image_1 || ''},
          thumb_image_2 = ${thumb_image_2 || ''},
          thumb_image_3 = ${thumb_image_3 || ''}
      WHERE id = ${parseInt(id, 10)}
    `;

    await setCollectionProducts(parseInt(id, 10), (Array.isArray(productIds) ? productIds : []).map(Number));

    revalidateCollectionStorefront();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections PUT:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'A valid collection ID is required.' }, { status: 400 });
    }

    const collectionRows = await sql`SELECT name FROM collections WHERE id = ${id}` as unknown as CollectionNameRow[];
    if (collectionRows.length === 0) {
      return NextResponse.json({ error: 'Collection not found.' }, { status: 404 });
    }

    await ensureProductCollectionsTable();
    await sql`DELETE FROM product_collections WHERE collection_id = ${id}`;
    // Products are kept, but their legacy primary value no longer points to a
    // collection that no longer exists.
    await sql`UPDATE products SET collection = 'Unassigned' WHERE collection = ${collectionRows[0].name}`;
    await sql`DELETE FROM collections WHERE id = ${id}`;

    revalidateCollectionStorefront();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections DELETE:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
