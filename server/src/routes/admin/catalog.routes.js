import crypto from 'node:crypto';
import { routeContext } from '../../http/api-context.js';

const {
  api, adminOnly, authLimiter, publicFormLimiter, checkoutLimiter, fail, asyncRoute, parse,
  moneyCents, fromCents, asNumber, cleanEmail, idSchema, quantitySchema, checkoutSchema,
  userDto, addressDto, availableProductPacks, productDto, productWithTiers, listProductDtos,
  couponDto, orderStatusForUi, orderDto, getOrderDto, getStoreSettings, getCart,
  getOrCreateCartId, getRazorpay, enqueueNotification, pool, transaction, clearSessionCookie,
  createAccessToken, hashPassword, hashToken, optionalAuth, requireAuth, safeEqual,
  setSessionCookie, verifyPassword, verifyAndCaptureOrder, INITIAL_PRODUCTS, z, requestRefund,
} = routeContext;

export function registerRoutes() {
api.get('/admin/dashboard', adminOnly, asyncRoute(async (_req, res) => {
  const [orders, products, inventory, quotes] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE order_status IN ('Pending','Confirmed','Processing'))::int AS pending, COALESCE(SUM(total) FILTER (WHERE payment_status='paid'),0)::numeric(12,2) AS revenue FROM orders"),
    pool.query("SELECT COUNT(*)::int AS total FROM products WHERE status='active'"),
    pool.query('SELECT COUNT(*)::int AS low_stock FROM products WHERE status=\'active\' AND stock_on_hand-stock_reserved <= low_stock_threshold'),
    pool.query("SELECT COUNT(*)::int AS open FROM bulk_quotes WHERE status IN ('new','reviewing','quoted')"),
  ]);
  res.json({ orders: orders.rows[0], products: products.rows[0], inventory: inventory.rows[0], quotes: quotes.rows[0] });
}));

api.get('/admin/categories', adminOnly, asyncRoute(async (_req,res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY display_order,name');
  res.json(result.rows);
}));
api.post('/admin/categories', adminOnly, asyncRoute(async (req,res) => {
  const body = parse(z.object({ name: z.string().trim().min(1).max(120), slug: z.string().trim().min(1).max(140), description: z.string().max(2000).optional().default(''), display_order: z.number().int().default(0), is_active: z.boolean().default(true) }),req.body);
  const result = await pool.query('INSERT INTO categories (name,slug,description,display_order,is_active) VALUES ($1,$2,$3,$4,$5) RETURNING *',[body.name,body.slug,body.description,body.display_order,body.is_active]);
  res.status(201).json(result.rows[0]);
}));
api.patch('/admin/categories/:id', adminOnly, asyncRoute(async (req,res) => {
  parse(idSchema,req.params.id);
  const body = parse(z.object({ name:z.string().trim().min(1).max(120).optional(), slug:z.string().trim().min(1).max(140).optional(), description:z.string().max(2000).optional(), display_order:z.number().int().optional(), is_active:z.boolean().optional() }),req.body);
  const result = await pool.query('UPDATE categories SET name=COALESCE($1,name),slug=COALESCE($2,slug),description=COALESCE($3,description),display_order=COALESCE($4,display_order),is_active=COALESCE($5,is_active),updated_at=NOW() WHERE id=$6 RETURNING *',[body.name,body.slug,body.description,body.display_order,body.is_active,req.params.id]);
  if (!result.rows[0]) fail(404,'CATEGORY_NOT_FOUND','Category not found.');
  res.json(result.rows[0]);
}));
api.get('/admin/collections', adminOnly, asyncRoute(async (_req,res) => {
  const result = await pool.query('SELECT * FROM collections ORDER BY display_order,name');
  res.json(result.rows);
}));
api.post('/admin/collections', adminOnly, asyncRoute(async (req,res) => {
  const body = parse(z.object({ name:z.string().trim().min(1).max(160), slug:z.string().trim().min(1).max(180), description:z.string().max(3000).optional().default(''), image:z.string().max(1000).optional(), display_order:z.number().int().default(0), is_active:z.boolean().default(true), productIds:z.array(idSchema).optional().default([]) }),req.body);
  const result = await transaction(async (client) => {
    const collection = await client.query('INSERT INTO collections (name,slug,description,image,display_order,is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[body.name,body.slug,body.description,body.image || null,body.display_order,body.is_active]);
    for (const productId of body.productIds) await client.query('INSERT INTO product_collections (product_id,collection_id) VALUES ($1,$2)',[productId,collection.rows[0].id]);
    return collection.rows[0];
  });
  res.status(201).json(result);
}));
api.patch('/admin/collections/:id', adminOnly, asyncRoute(async (req,res) => {
  parse(idSchema,req.params.id);
  const body = parse(z.object({ name:z.string().trim().min(1).max(160).optional(), slug:z.string().trim().min(1).max(180).optional(), description:z.string().max(3000).optional(), image:z.string().max(1000).optional(), display_order:z.number().int().optional(), is_active:z.boolean().optional(), productIds:z.array(idSchema).optional() }),req.body);
  const result = await transaction(async (client) => {
    const updated = await client.query('UPDATE collections SET name=COALESCE($1,name),slug=COALESCE($2,slug),description=COALESCE($3,description),image=COALESCE($4,image),display_order=COALESCE($5,display_order),is_active=COALESCE($6,is_active),updated_at=NOW() WHERE id=$7 RETURNING *',[body.name,body.slug,body.description,body.image,body.display_order,body.is_active,req.params.id]);
    if (!updated.rows[0]) return null;
    if (body.productIds) {
      await client.query('DELETE FROM product_collections WHERE collection_id=$1',[req.params.id]);
      for (const productId of body.productIds) await client.query('INSERT INTO product_collections (product_id,collection_id) VALUES ($1,$2)',[productId,req.params.id]);
    }
    return updated.rows[0];
  });
  if (!result) fail(404,'COLLECTION_NOT_FOUND','Collection not found.');
  res.json(result);
}));
api.delete('/admin/collections/:id', adminOnly, asyncRoute(async (req,res) => {
  parse(idSchema,req.params.id);
  const result = await pool.query('UPDATE collections SET is_active=FALSE,updated_at=NOW() WHERE id=$1',[req.params.id]);
  if (!result.rowCount) fail(404,'COLLECTION_NOT_FOUND','Collection not found.');
  res.status(204).end();
}));

api.get('/admin/products', adminOnly, asyncRoute(async (_req, res) => {
  const rows = await pool.query('SELECT * FROM products ORDER BY updated_at DESC');
  res.json(await Promise.all(rows.rows.map((row) => productWithTiers(pool, row))));
}));
api.put('/admin/products/:id/bulk-tiers', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ minOrderQty: z.number().int().positive(), tiers: z.array(z.object({ minimumQuantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })).min(1).max(100) }), req.body);
  const distinct = new Set(body.tiers.map((tier) => tier.minimumQuantity));
  if (distinct.size !== body.tiers.length) fail(400, 'DUPLICATE_TIER', 'Bulk quantity thresholds must be unique.');
  const product = await transaction(async (client) => {
    const existing = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!existing.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    await client.query('DELETE FROM bulk_price_tiers WHERE product_id=$1', [req.params.id]);
    for (const tier of body.tiers) await client.query('INSERT INTO bulk_price_tiers (product_id,minimum_quantity,unit_price) VALUES ($1,$2,$3)', [req.params.id,tier.minimumQuantity,tier.unitPrice]);
    const data = { ...existing.rows[0].product_data, minOrderQty: body.minOrderQty };
    const updated = await client.query('UPDATE products SET min_order_qty=$1,product_data=$2::jsonb,updated_at=NOW() WHERE id=$3 RETURNING *', [body.minOrderQty,JSON.stringify(data),req.params.id]);
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [req.user.id,'product.bulk_pricing_updated','product',req.params.id,JSON.stringify(body)]);
    return updated.rows[0];
  });
  res.json(await productWithTiers(pool,product));
}));
api.post('/admin/products/:id/images', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ image_url: z.string().trim().min(1).max(1000), alt_text: z.string().trim().max(300).optional().default(''), sort_order: z.number().int().nonnegative().optional(), is_primary: z.boolean().optional().default(false) }), req.body);
  const result = await transaction(async (client) => {
    const found = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!found.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    const images = [...(found.rows[0].product_data.images || [])];
    if (body.is_primary) images.unshift(body.image_url); else images.push(body.image_url);
    const data = { ...found.rows[0].product_data, image: body.is_primary ? body.image_url : (found.rows[0].product_data.image || body.image_url), images: [...new Set(images)] };
    const updated = await client.query('UPDATE products SET product_data=$1::jsonb,updated_at=NOW() WHERE id=$2 RETURNING *', [JSON.stringify(data),req.params.id]);
    return updated.rows[0];
  });
  res.status(201).json(await productWithTiers(pool,result));
}));
api.post('/admin/products', adminOnly, asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(200), slug: z.string().trim().min(2).max(220), numericPrice: z.number().nonnegative(), stockCount: z.number().int().nonnegative().default(0), sku: z.string().trim().min(2).max(80).optional(), category: z.string().trim().min(1).max(80).default('raw'), minOrderQty: z.number().int().positive().optional().default(1), bulkTiers: z.array(z.object({ minimumQuantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })).optional().default([]) }).passthrough(), req.body);
  const row = await transaction(async (client) => {
    const sku = body.sku || `MMK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const productData = { ...body, numericPrice: body.numericPrice, price: `₹${body.numericPrice}`, stockCount: body.stockCount, inStock: body.stockCount > 0, sku, isActive: true };
    const inserted = await client.query('INSERT INTO products (name,slug,sku,category,base_price,stock_on_hand,low_stock_threshold,min_order_qty,product_data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING *', [body.name,body.slug,sku,body.category,body.numericPrice,body.stockCount,20,body.minOrderQty,JSON.stringify(productData)]);
    for (const tier of body.bulkTiers) await client.query('INSERT INTO bulk_price_tiers (product_id,minimum_quantity,unit_price) VALUES ($1,$2,$3)', [inserted.rows[0].id,tier.minimumQuantity,tier.unitPrice]);
    if (body.stockCount) await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,actor_id) VALUES ($1,$2,$3,$4)', [inserted.rows[0].id,body.stockCount,'Initial stock',req.user.id]);
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [req.user.id,'product.created','product',inserted.rows[0].id,JSON.stringify(productData)]);
    return inserted.rows[0];
  });
  res.status(201).json(await productWithTiers(pool, row));
}));
api.patch('/admin/products/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const patchBody = z.object({ name: z.string().trim().min(2).max(200).optional(), slug: z.string().trim().min(2).max(220).optional(), numericPrice: z.number().nonnegative().optional(), stockCount: z.number().int().nonnegative().optional(), weight: z.string().max(120).optional(), category: z.string().trim().min(1).max(80).optional(), image: z.string().max(1000).optional(), images: z.array(z.string().max(1000)).optional(), description: z.string().max(10000).optional(), minOrderQty: z.number().int().positive().optional(), lowStockThreshold: z.number().int().nonnegative().optional(), bulkTiers: z.array(z.object({ minimumQuantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })).optional() }).passthrough();
  const body = parse(patchBody, req.body);
  const updated = await transaction(async (client) => {
    const currentResult = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [req.params.id]);
    const current = currentResult.rows[0];
    if (!current) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    const merged = { ...current.product_data, ...body };
    if (body.numericPrice != null) merged.price = `₹${body.numericPrice}`;
    if (body.stockCount != null) {
      if (body.stockCount < current.stock_reserved) fail(409, 'RESERVED_STOCK_CONFLICT', 'Stock cannot be reduced below the quantity held for active checkouts.');
      const delta = body.stockCount - current.stock_on_hand;
      if (delta) await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,actor_id) VALUES ($1,$2,$3,$4)', [current.id,delta,'Admin product edit',req.user.id]);
      merged.inStock = body.stockCount > 0;
    }
    merged.stockCount = body.stockCount ?? current.stock_on_hand - current.stock_reserved;
    const result = await client.query(
      `UPDATE products SET name=COALESCE($1,name),slug=COALESCE($2,slug),category=COALESCE($3,category),base_price=COALESCE($4,base_price),stock_on_hand=COALESCE($5,stock_on_hand),low_stock_threshold=COALESCE($6,low_stock_threshold),min_order_qty=COALESCE($7,min_order_qty),product_data=$8::jsonb,updated_at=NOW() WHERE id=$9 RETURNING *`,
      [body.name,body.slug,body.category,body.numericPrice,body.stockCount,body.lowStockThreshold,body.minOrderQty,JSON.stringify(merged),req.params.id],
    );
    if (body.bulkTiers) {
      const unique = new Set(body.bulkTiers.map((tier) => tier.minimumQuantity));
      if (unique.size !== body.bulkTiers.length) fail(400, 'DUPLICATE_TIER', 'Bulk quantity thresholds must be unique.');
      await client.query('DELETE FROM bulk_price_tiers WHERE product_id=$1', [current.id]);
      for (const tier of body.bulkTiers) await client.query('INSERT INTO bulk_price_tiers (product_id,minimum_quantity,unit_price) VALUES ($1,$2,$3)', [current.id,tier.minimumQuantity,tier.unitPrice]);
    }
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,before_state,after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [req.user.id,'product.updated','product',current.id,JSON.stringify(current.product_data),JSON.stringify(merged)]);
    return result.rows[0];
  });
  res.json(await productWithTiers(pool, updated));
}));
api.delete('/admin/products/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const result = await pool.query("UPDATE products SET status='archived',updated_at=NOW() WHERE id=$1 RETURNING id,name", [req.params.id]);
  if (!result.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  await pool.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [req.user.id,'product.archived','product',req.params.id,JSON.stringify(result.rows[0])]);
  res.status(204).end();
}));
api.post('/admin/products/reset', adminOnly, asyncRoute(async (_req, res) => {
  await transaction(async (client) => {
    const active = await client.query('SELECT id FROM products WHERE stock_reserved>0 FOR UPDATE');
    if (active.rowCount) fail(409,'ACTIVE_RESERVATIONS','The catalogue cannot be reset while checkout reservations are active.');
    await client.query("UPDATE products SET status='archived',updated_at=NOW() WHERE legacy_id IS NULL");
    for (const product of INITIAL_PRODUCTS) {
      const existing = await client.query('SELECT * FROM products WHERE legacy_id=$1 FOR UPDATE',[product.id]);
      if (existing.rows[0]) {
        if (Number(existing.rows[0].stock_reserved) > 0) fail(409,'ACTIVE_RESERVATIONS','The catalogue cannot be reset while checkout reservations are active.');
        const sku = product.sku || `MMK-${product.id}`;
        const savedData = { ...product, id: existing.rows[0].id, sku, stockCount: product.stockCount || 0 };
        await client.query('DELETE FROM bulk_price_tiers WHERE product_id=$1',[existing.rows[0].id]);
        await client.query("UPDATE products SET name=$1,slug=$2,sku=$3,category=$4,status='active',base_price=$5,stock_on_hand=$6,stock_reserved=0,min_order_qty=1,product_data=$7::jsonb,updated_at=NOW() WHERE id=$8", [product.name,product.slug,sku,product.category || 'raw',product.numericPrice || 0,product.stockCount || 0,JSON.stringify(savedData),existing.rows[0].id]);
        const delta = Number(product.stockCount || 0)-Number(existing.rows[0].stock_on_hand);
        if (delta) await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,actor_id) VALUES ($1,$2,$3,$4)',[existing.rows[0].id,delta,'Admin reset catalogue stock',_req.user.id]);
      } else {
        const sku = product.sku || `MMK-${product.id}`;
        await client.query('INSERT INTO products (legacy_id,name,slug,sku,category,base_price,stock_on_hand,product_data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)', [product.id,product.name,product.slug,sku,product.category || 'raw',product.numericPrice || 0,product.stockCount || 0,JSON.stringify(product)]);
      }
    }
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [_req.user.id,'catalog.reset','product_catalog','default',JSON.stringify({ count: INITIAL_PRODUCTS.length })]);
  });
  res.json(await listProductDtos());
}));


}
