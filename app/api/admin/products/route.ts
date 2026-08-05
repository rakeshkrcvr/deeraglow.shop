import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import { getProducts } from '@/lib/products';
import { addProductToNamedCollection, ensureProductCollectionsTable } from '@/lib/productCollections';

// Helper to format string into URL-friendly slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

function revalidateProductStorefront() {
  revalidatePath('/');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/category/[slug]', 'page');
}

// GET: Fetch products for admin, including trash
export async function GET() {
  try {
    const products = await getProducts({ includeDeleted: true });
    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST: Add new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, collection, price, compare_price, inventory, description, image_url, features,
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
    const comparePriceValue = parseInt(compare_price, 10);
    const parsedComparePrice = Number.isFinite(comparePriceValue) ? comparePriceValue : null;
    const inventoryValue = parseInt(inventory, 10);
    const parsedInventory = Number.isFinite(inventoryValue) && inventoryValue >= 0 ? inventoryValue : 10;

    const created = await sql`
      INSERT INTO products (
        name, slug, collection, price, compare_price, inventory, rating, reviews_count, description, image_url, features,
        tagline, fragrances, dimensions, weight, burn_hours, acc_burn_time, acc_ingredients, acc_instructions, acc_shipping,
        images
      )
      VALUES (
        ${name}, ${slug}, ${collection}, ${parsedPrice}, ${parsedComparePrice}, ${parsedInventory}, ${rating}, ${reviews_count}, ${description}, ${image_url}, ${features},
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
      RETURNING id
    ` as unknown as { id: number }[];
    await ensureProductCollectionsTable();
    await addProductToNamedCollection(created[0].id, collection);

    revalidateProductStorefront();

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
      id, name, collection, price, compare_price, inventory, description, image_url, features,
      tagline, fragrances, dimensions, weight, burn_hours,
      acc_burn_time, acc_ingredients, acc_instructions, acc_shipping,
      images
    } = body;

    if (!id || !name || !collection || !price || !description || !image_url || !features) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const parsedPrice = parseInt(price, 10);
    const comparePriceValue = parseInt(compare_price, 10);
    const parsedComparePrice = Number.isFinite(comparePriceValue) ? comparePriceValue : null;
    const inventoryValue = parseInt(inventory, 10);
    const parsedInventory = Number.isFinite(inventoryValue) && inventoryValue >= 0 ? inventoryValue : 10;

    await sql`
      UPDATE products
      SET name = ${name}, slug = ${slug}, collection = ${collection}, price = ${parsedPrice}, compare_price = ${parsedComparePrice}, inventory = ${parsedInventory},
          description = ${description}, image_url = ${image_url}, features = ${features},
          tagline = ${tagline}, fragrances = ${fragrances}, dimensions = ${dimensions}, 
          weight = ${weight}, burn_hours = ${burn_hours}, acc_burn_time = ${acc_burn_time}, 
          acc_ingredients = ${acc_ingredients}, acc_instructions = ${acc_instructions}, 
          acc_shipping = ${acc_shipping}, images = ${images || ''}
      WHERE id = ${parseInt(id, 10)}
    `;
    await ensureProductCollectionsTable();
    await addProductToNamedCollection(parseInt(id, 10), collection);

    revalidateProductStorefront();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PATCH: Restore product from trash
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || action !== 'restore') {
      return NextResponse.json({ error: 'Missing product ID or invalid action' }, { status: 400 });
    }

    await getProducts({ includeDeleted: true });
    await sql`UPDATE products SET deleted_at = NULL WHERE id = ${parseInt(id, 10)}`;
    revalidateProductStorefront();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error restoring product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE: Move product to trash, or permanently remove with permanent=true
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    await getProducts({ includeDeleted: true });

    if (permanent) {
      await sql`DELETE FROM products WHERE id = ${parseInt(id, 10)}`;
    } else {
      await sql`UPDATE products SET deleted_at = NOW() WHERE id = ${parseInt(id, 10)}`;
    }

    revalidateProductStorefront();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
