import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_REVIEWS } from '../seed/catalog-data.js';
import { hashPassword } from '../middleware/authentication.js';
import { pool, transaction } from '../config/database.js';

export async function seedDefaults() {
  await transaction(async (client) => {
    const productsByLegacyId = new Map();
    for (const product of INITIAL_PRODUCTS) {
      const sku = product.sku || `MMK-${product.id}`;
      const inserted = await client.query(
        `INSERT INTO products (legacy_id, name, slug, sku, category, base_price, stock_on_hand, product_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         ON CONFLICT (slug) DO UPDATE SET
           legacy_id = COALESCE(products.legacy_id, EXCLUDED.legacy_id),
           name = EXCLUDED.name,
           sku = EXCLUDED.sku,
           category = EXCLUDED.category,
           base_price = EXCLUDED.base_price,
           stock_on_hand = EXCLUDED.stock_on_hand,
           status = 'active',
           product_data = EXCLUDED.product_data,
           updated_at = NOW()
         RETURNING id, legacy_id`,
        [product.id, product.name, product.slug, sku, product.category || 'raw', product.numericPrice || product.packs?.[0]?.price || 0, Math.max(0, product.stockCount || 0), JSON.stringify(product)],
      );
      productsByLegacyId.set(Number(inserted.rows[0].legacy_id), inserted.rows[0].id);
    }
    // Permanently remove all obsolete products and orphaned references from the database
    const activeLegacyIds = INITIAL_PRODUCTS.map((p) => Number(p.id));
    await client.query("DELETE FROM stock_reservations WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM inventory_movements WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM cart_items WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM reviews WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM product_collections WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM bulk_price_tiers WHERE product_id NOT IN (SELECT id FROM products WHERE legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    await client.query("DELETE FROM products WHERE legacy_id IS NULL OR NOT (legacy_id = ANY($1::int[]))", [activeLegacyIds]);
    const categories = [...new Set(INITIAL_PRODUCTS.map((product) => product.category || 'raw'))];
    for (const [position, category] of categories.entries()) {
      const slug = String(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await client.query('INSERT INTO categories (name,slug,display_order) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [String(category),slug,position]);
    }
    const collectionNames = new Set(INITIAL_PRODUCTS.flatMap((product) => {
      const values = product.collections || (product.collection ? [product.collection] : []);
      return (Array.isArray(values) ? values : [values]).map((item) => typeof item === 'string' ? item : item?.name).filter(Boolean);
    }));
    const collectionIds = new Map();
    for (const [position, name] of [...collectionNames].entries()) {
      const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const result = await client.query('INSERT INTO collections (name,slug,display_order) VALUES ($1,$2,$3) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id,slug', [name,slug,position]);
      collectionIds.set(result.rows[0].slug,result.rows[0].id);
    }
    for (const product of INITIAL_PRODUCTS) {
      const productId = productsByLegacyId.get(Number(product.id));
      const values = product.collections || (product.collection ? [product.collection] : []);
      for (const item of Array.isArray(values) ? values : [values]) {
        const name = typeof item === 'string' ? item : item?.name;
        if (!name) continue;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const collectionId = collectionIds.get(slug);
        if (collectionId) await client.query('INSERT INTO product_collections (product_id,collection_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [productId,collectionId]);
      }
    }
    for (const coupon of INITIAL_COUPONS) {
      await client.query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, description, active, usage_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (code) DO NOTHING`,
        [coupon.code, coupon.discountType === 'fixed' ? 'fixed' : coupon.discountType, coupon.discountValue, coupon.minOrder || 0, coupon.maxDiscount ?? null, coupon.description, coupon.active, coupon.usageCount || 0],
      );
    }
    await client.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, description, active, usage_count)
      SELECT 'POPCO10', discount_type, discount_value, min_order, max_discount, description, active, usage_count
      FROM coupons WHERE code = 'MUKEJA10'
      ON CONFLICT (code) DO NOTHING
    `);
    await client.query("DELETE FROM coupons WHERE code = 'MUKEJA10'");
    for (const review of INITIAL_REVIEWS) {
      const productId = productsByLegacyId.get(Number(review.productId));
      if (!productId) continue;
      await client.query(
        `INSERT INTO reviews (product_id, author, rating, title, comment, location, verified)
         SELECT $1, $2, $3, $4, $5, $6, $7
         WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = $1 AND author = $2 AND comment = $5)`,
        [productId, review.author, review.rating, review.title || '', review.comment, review.location || null, Boolean(review.verified)],
      );
    }
    const defaults = {
      storeName: 'POP CO',
      announcementText: 'FREE SHIPPING ON ALL ORDERS ABOVE ₹599 ',
      whatsappNumber: '918080808447',
      supportEmail: process.env.SUPPORT_EMAIL || 'Support@thepopcoindia.com',
      freeShippingThreshold: 599,
      standardShippingFee: 60,
    };
    await client.query(`
      INSERT INTO store_settings (key, value) VALUES ($1, $2::jsonb)
      ON CONFLICT (key) DO UPDATE SET
        value = jsonb_set(store_settings.value, '{storeName}', to_jsonb('PopCo'::text), true),
        updated_at = NOW()
    `, ['store', JSON.stringify(defaults)]);
  });

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
    if (!existing.rowCount) {
      await pool.query(
        `INSERT INTO customers (full_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'admin')`,
      [process.env.ADMIN_NAME || 'Store Administrator', email, process.env.ADMIN_PHONE || '', await hashPassword(process.env.ADMIN_PASSWORD)],
      );
      console.log(`Created initial administrator ${email}.`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await seedDefaults();
  await pool.end();
  console.log('Initial catalogue and settings are available.');
}
