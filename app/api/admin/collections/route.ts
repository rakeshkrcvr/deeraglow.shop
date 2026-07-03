import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

    // Check count - if less than 35, let's clear and seed all 40 requested categories!
    const checkCount = await sql`SELECT COUNT(*) FROM collections` as any;
    const count = parseInt(checkCount[0].count, 10);

    if (count < 35) {
      // Clear existing to prevent duplicates
      await sql`TRUNCATE TABLE collections RESTART IDENTITY CASCADE`;

      const seedCollections = [
        // 1. Collection
        { name: 'Scented Candles', desc: 'Artisanal candles infused with organic aromatherapy essential oils.', slug: 'scented-candles' },
        { name: 'Soy Wax Candles', desc: 'Clean-burning, eco-friendly candles poured with 100% natural soy wax.', slug: 'soy-wax-candles' },
        { name: 'Jar Candles', desc: 'Elegant glass and ceramic jars containing slow-burning aromatic waxes.', slug: 'jar-candles' },
        { name: 'Luxury Candles', desc: 'Exquisite premier vessels and rare, complex signature fragrance blends.', slug: 'luxury-candles' },
        { name: 'Decorative Candles', desc: 'Sculpted shapes and aesthetic centerpieces for beautiful home spaces.', slug: 'decorative-candles' },
        { name: 'Mini Candles', desc: 'Petite, travel-friendly samplers perfect for exploring new scents.', slug: 'mini-candles' },
        { name: 'Large Candles', desc: 'Multi-wick candles crafted for maximum scent throw and longevity.', slug: 'large-candles' },
        { name: 'Travel Candles', desc: 'Lightweight tin containers ideal for setting a cozy mood anywhere.', slug: 'travel-candles' },

        // 2. Fragrance
        { name: 'Vanilla', desc: 'Sweet, warm, and comforting classic vanilla bean notes.', slug: 'vanilla' },
        { name: 'Lavender', desc: 'Soothing French lavender fields to promote rest and peaceful calm.', slug: 'lavender' },
        { name: 'Rose', desc: 'Freshly cut romantic red rose petals and delicate floral hints.', slug: 'rose' },
        { name: 'Jasmine', desc: 'Exotic, blooming night jasmines for a sweet, uplifting floral atmosphere.', slug: 'jasmine' },
        { name: 'Sandalwood', desc: 'Earthy, rich, and woodsy sacred Indian sandalwood.', slug: 'sandalwood' },
        { name: 'Coffee', desc: 'Energizing freshly roasted espresso beans with hints of sweet cream.', slug: 'coffee' },
        { name: 'Citrus', desc: 'Uplifting, bright, and zesty orange and lemon peels.', slug: 'citrus' },
        { name: 'Ocean Breeze', desc: 'Crisp, refreshing sea salt and coastal marine breeze notes.', slug: 'ocean-breeze' },
        { name: 'Oud', desc: 'Mysterious, luxurious, and woody Arabian agarwood extracts.', slug: 'oud' },
        { name: 'Mixed Fruits', desc: 'Sweet, juicy blend of summer berries and orchard apples.', slug: 'mixed-fruits' },

        // 3. Purpose
        { name: 'Home Décor', desc: 'Curated candle collections to elevate home styling and lighting.', slug: 'home-decor' },
        { name: 'Relaxation & Spa', desc: 'Calming scents designed for massage, bathing, and self-care.', slug: 'relaxation-spa' },
        { name: 'Meditation', desc: 'Grounding herbal notes to aid focus and deep reflection.', slug: 'meditation' },
        { name: 'Yoga', desc: 'Fresh and clean aromas to accompany your daily flows and stretches.', slug: 'yoga' },
        { name: 'Bedroom', desc: 'Soft, relaxing fragrances suited for night-time wind-downs.', slug: 'bedroom' },
        { name: 'Living Room', desc: 'Inviting, warm aromas perfect for gathering spaces.', slug: 'living-room' },
        { name: 'Bathroom', desc: 'Clean, clarifying scents to refresh your space.', slug: 'bathroom' },
        { name: 'Office', desc: 'Focus-boosting citrus and cedar notes for productivity.', slug: 'office' },

        // 4. Occasion
        { name: 'Birthday Gifts', desc: 'Festive, celebratory candles ideal for gifting.', slug: 'birthday-gifts' },
        { name: 'Anniversary Gifts', desc: 'Romantic, premium scents to celebrate special milestones.', slug: 'anniversary-gifts' },
        { name: 'Wedding Gifts', desc: 'Elegant custom candle favors and luxury gift sets.', slug: 'wedding-gifts' },
        { name: 'Housewarming Gifts', desc: 'Warm, welcoming fragrances for new beginnings.', slug: 'housewarming-gifts' },
        { name: 'Diwali Collection', desc: 'Traditional brass-style bowls and festive lights.', slug: 'diwali-collection' },
        { name: 'Christmas Collection', desc: 'Spiced pine, cinnamon, and winter solstice scents.', slug: 'christmas-collection' },
        { name: 'Valentine\'s Day', desc: 'Passionate rose, vanilla, and chocolate scented delights.', slug: 'valentines-day' },
        { name: 'Mother\'s Day', desc: 'Delicate florals and relaxing lavender to pamper mothers.', slug: 'mothers-day' },

        // 5. Premium
        { name: 'Best Sellers', desc: 'The most popular and loved candles in our collection.', slug: 'best-sellers' },
        { name: 'New Arrivals', desc: 'Freshly poured seasonal releases and new fragrance blends.', slug: 'new-arrivals' },
        { name: 'Limited Edition', desc: 'Rare hand-crafted batches and unique custom vessels.', slug: 'limited-edition' },
        { name: 'Luxury Collection', desc: 'Premium double-scented candles in hand-cut glass.', slug: 'luxury-collection' },
        { name: 'Gift Sets', desc: 'Beautifully boxed assortments of our signature candle tins.', slug: 'gift-sets' },
        { name: 'Combo Packs', desc: 'Curated scent pairs at special pricing.', slug: 'combo-packs' }
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
  } catch (error: any) {
    console.error('Error in collections GET:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error in collections POST:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
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
    const oldCollRes = await sql`SELECT name FROM collections WHERE id = ${parseInt(id, 10)}` as any;
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
  } catch (error: any) {
    console.error('Error in collections PUT:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error in collections DELETE:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
