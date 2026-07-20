import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';

type CountRow = { count: string };
type CollectionNameRow = { name: string };

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

    // Check if we need to migrate/seed
    const existingCollections = await sql`SELECT name FROM collections` as unknown as CollectionNameRow[];
    const hasCandleCollections = existingCollections.some(c => 
      c.name.toLowerCase().includes('candle') || 
      c.name.toLowerCase().includes('scent') || 
      c.name.toLowerCase().includes('wax')
    );

    if (existingCollections.length < 35 || hasCandleCollections) {
      // Clear existing to prevent duplicates
      await sql`TRUNCATE TABLE collections RESTART IDENTITY CASCADE`;

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
        { name: '925 Sterling Silver', desc: 'Anti-tarnish, hypoallergenic premium silver jewelry.', slug: 'sterling-silver' },
        { name: '18k Gold Plated', desc: 'Luxurious warm gold finishes over sterling silver and brass.', slug: 'gold-plated' },
        { name: 'Rose Gold Jewelry', desc: 'Romantic and modern pink-gold plated accessories.', slug: 'rose-gold' },
        { name: 'Gemstone Jewelry', desc: 'Adorned with high-quality emeralds, rubies, and premium crystals.', slug: 'gemstone-jewelry' },

        // 6. Occasions & Gifting
        { name: 'Birthday Gifts', desc: 'Make their birthday memorable with personalized jewelry gifts.', slug: 'birthday-gifts' },
        { name: 'Anniversary Gifts', desc: 'Celebrate beautiful milestones with timeless rings and necklaces.', slug: 'anniversary-gifts' },
        { name: 'Wedding Jewelry', desc: 'Bridal and bridesmaid statement collections that shine.', slug: 'wedding-jewelry' },
        { name: 'Festive Collection', desc: 'Shining jewelry perfect for Diwali, Eid, and family celebrations.', slug: 'festive-collection' },
        { name: 'Daily Wear', desc: 'Hypoallergenic, lightweight pieces comfortable for long daily hours.', slug: 'daily-wear' },
        { name: 'Office Wear', desc: 'Sleek, professional, and subtle accessories for the workplace.', slug: 'office-wear' },
        { name: 'Party Wear', desc: 'Bold, eye-catching jewelry designed to steal the spotlight.', slug: 'party-wear' },
        { name: 'Valentine\'s Day', desc: 'Romantic heart pendants and promise rings for your loved one.', slug: 'valentines-day' },

        // 7. Curations
        { name: 'Best Sellers', desc: 'The most popular and loved jewelry pieces chosen by our customers.', slug: 'best-sellers' },
        { name: 'New Arrivals', desc: 'Freshly launched trend-setting designs for this season.', slug: 'new-arrivals' },
        { name: 'Gift Sets', desc: 'Beautifully boxed matching necklace and earring combinations.', slug: 'gift-sets' }
      ];

      for (const coll of seedCollections) {
        await sql`
          INSERT INTO collections (name, description, slug)
          VALUES (${coll.name}, ${coll.desc}, ${coll.slug})
        `;
      }
      console.log('Successfully seeded all 40 requested collections!');
    }

    const collections = await sql`SELECT * FROM collections ORDER BY id ASC`;
    return NextResponse.json(collections);
  } catch (error: unknown) {
    console.error('Error in collections GET:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, productIds } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Missing name or description' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await sql`
      INSERT INTO collections (name, description, slug)
      VALUES (${name}, ${description}, ${slug})
    `;

    // Associate product ids if provided
    if (Array.isArray(productIds) && productIds.length > 0) {
      for (const prodId of productIds) {
        await sql`UPDATE products SET collection = ${name} WHERE id = ${parseInt(prodId, 10)}`;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections POST:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, productIds } = body;

    if (!id || !name || !description) {
      return NextResponse.json({ error: 'Missing ID, name or description' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // 1. Fetch old collection name
    const oldCollRes = await sql`SELECT name FROM collections WHERE id = ${parseInt(id, 10)}` as unknown as CollectionNameRow[];
    if (oldCollRes.length > 0) {
      const oldName = oldCollRes[0].name;

      // 2. Clear old products associated with this collection
      await sql`UPDATE products SET collection = 'Unassigned' WHERE collection = ${oldName}`;
    }

    // 3. Update collection details
    await sql`
      UPDATE collections
      SET name = ${name}, description = ${description}, slug = ${slug}
      WHERE id = ${parseInt(id, 10)}
    `;

    // 4. Associate new products
    if (Array.isArray(productIds) && productIds.length > 0) {
      for (const prodId of productIds) {
        await sql`UPDATE products SET collection = ${name} WHERE id = ${parseInt(prodId, 10)}`;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections PUT:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await sql`DELETE FROM collections WHERE id = ${parseInt(id, 10)}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in collections DELETE:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
