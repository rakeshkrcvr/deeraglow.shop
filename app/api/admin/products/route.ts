import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';

// Helper to format string into URL-friendly slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// POST: Add new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, collection, price, description, image_url, features,
      tagline, fragrances, dimensions, weight, burn_hours,
      acc_burn_time, acc_ingredients, acc_instructions, acc_shipping,
      images
    } = body;

    if (!name || !collection || !price || !description || !image_url || !features) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const rating = 4.8; // Default rating for new products
    const reviews_count = 12; // Default starting reviews
    const parsedPrice = parseInt(price, 10);

    await sql`
      INSERT INTO products (
        name, slug, collection, price, rating, reviews_count, description, image_url, features,
        tagline, fragrances, dimensions, weight, burn_hours, acc_burn_time, acc_ingredients, acc_instructions, acc_shipping,
        images
      )
      VALUES (
        ${name}, ${slug}, ${collection}, ${parsedPrice}, ${rating}, ${reviews_count}, ${description}, ${image_url}, ${features},
        ${tagline || '100% natural soy wax — wooden wick — 30-40 hours burn time'},
        ${fragrances || 'Oud, Jasmin, Rose, Vanilla'},
        ${dimensions || 'W: 2.5 inch x H: 3 inch'},
        ${weight || '350 gms'},
        ${burn_hours || '32 Hrs'},
        ${acc_burn_time || '32 Hours average'},
        ${acc_ingredients || '100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.'},
        ${acc_instructions || 'Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.'},
        ${acc_shipping || 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.'},
        ${images || ''}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT: Update existing product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, name, collection, price, description, image_url, features,
      tagline, fragrances, dimensions, weight, burn_hours,
      acc_burn_time, acc_ingredients, acc_instructions, acc_shipping,
      images
    } = body;

    if (!id || !name || !collection || !price || !description || !image_url || !features) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const parsedPrice = parseInt(price, 10);

    await sql`
      UPDATE products
      SET name = ${name}, slug = ${slug}, collection = ${collection}, price = ${parsedPrice}, 
          description = ${description}, image_url = ${image_url}, features = ${features},
          tagline = ${tagline}, fragrances = ${fragrances}, dimensions = ${dimensions}, 
          weight = ${weight}, burn_hours = ${burn_hours}, acc_burn_time = ${acc_burn_time}, 
          acc_ingredients = ${acc_ingredients}, acc_instructions = ${acc_instructions}, 
          acc_shipping = ${acc_shipping}, images = ${images || ''}
      WHERE id = ${parseInt(id, 10)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE: Remove product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    await sql`DELETE FROM products WHERE id = ${parseInt(id, 10)}`;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
