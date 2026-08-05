import { sql } from './db';

type CountRow = { count: string };

/**
 * Stores collection membership separately from a product's primary collection.
 * This lets one product appear in as many curated collections as needed.
 */
export async function ensureProductCollectionsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS product_collections (
      product_id INTEGER NOT NULL,
      collection_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, collection_id)
    )
  `;

  // One-time migration: preserve every existing product's original collection.
  // It runs only while the new relationship table is empty, so removing a
  // product from a collection remains permanent.
  const rows = await sql`SELECT COUNT(*)::text AS count FROM product_collections` as unknown as CountRow[];
  if (Number(rows[0]?.count || '0') !== 0) return;

  try {
    await sql`
      INSERT INTO product_collections (product_id, collection_id)
      SELECT p.id, c.id
      FROM products p
      INNER JOIN collections c ON LOWER(c.name) = LOWER(p.collection)
      WHERE p.collection <> 'Unassigned'
      ON CONFLICT (product_id, collection_id) DO NOTHING
    `;
  } catch {
    // The collections table may not exist on a first public request. A later
    // admin/collections request will safely run this migration instead.
  }
}

export async function setCollectionProducts(collectionId: number, productIds: number[]) {
  await ensureProductCollectionsTable();
  await sql`DELETE FROM product_collections WHERE collection_id = ${collectionId}`;

  for (const productId of new Set(productIds)) {
    if (Number.isInteger(productId) && productId > 0) {
      await sql`
        INSERT INTO product_collections (product_id, collection_id)
        VALUES (${productId}, ${collectionId})
        ON CONFLICT (product_id, collection_id) DO NOTHING
      `;
    }
  }
}

export async function addProductToNamedCollection(productId: number, collectionName: string) {
  await ensureProductCollectionsTable();
  await sql`
    INSERT INTO product_collections (product_id, collection_id)
    SELECT ${productId}, id FROM collections WHERE LOWER(name) = LOWER(${collectionName})
    ON CONFLICT (product_id, collection_id) DO NOTHING
  `;
}
