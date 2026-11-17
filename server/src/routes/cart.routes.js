import { routeContext } from '../http/api-context.js';

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
api.get('/cart', asyncRoute(async (req, res) => res.json(await getCart(pool, req.get('x-cart-token'), req.user?.id || null))));
api.post('/cart/items', asyncRoute(async (req, res) => {
  const body = parse(z.object({ productId: z.string().uuid(), packCount: quantitySchema.optional().default(1), packLabel: z.string().trim().min(1).max(80).optional().default('Single Pack'), quantity: quantitySchema }), req.body);
  const result = await transaction(async (client) => {
    const cartId = await getOrCreateCartId(client, req.get('x-cart-token'), req.user?.id || null);
    const productResult = await client.query("SELECT * FROM products WHERE id = $1 AND status = 'active'", [body.productId]);
    const product = productResult.rows[0];
    if (!product) fail(422, 'PRODUCT_UNAVAILABLE', 'This product is no longer available.');
    const pack = availableProductPacks(product).find((option) => Number(option.count) === body.packCount);
    if (!pack) fail(422, 'INVALID_VARIANT', 'The selected pack is not available.');
    const total = await client.query('SELECT COALESCE(SUM(quantity),0)::int AS quantity FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND pack_count=$3', [cartId, body.productId, body.packCount]);
    const desired = total.rows[0].quantity + body.quantity;
    const available = product.stock_on_hand - product.stock_reserved;
    if (desired * body.packCount > available) fail(409, 'INSUFFICIENT_STOCK', 'The requested quantity is no longer available.');
    if (desired < product.min_order_qty) fail(422, 'MOQ_NOT_MET', `The minimum order quantity for this product is ${product.min_order_qty}.`);
    const [anyTier, matchingTier] = await Promise.all([
      client.query('SELECT 1 FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE LIMIT 1',[body.productId]),
      client.query('SELECT 1 FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE AND minimum_quantity <= $2 LIMIT 1',[body.productId,desired]),
    ]);
    if (anyTier.rowCount && !matchingTier.rowCount) fail(422,'TIER_NOT_CONFIGURED','No quantity price is configured for this product at that quantity.');
    await client.query(
      `INSERT INTO cart_items (cart_id,product_id,pack_count,pack_label,quantity) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (cart_id,product_id,pack_count) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cartId, body.productId, body.packCount, body.packLabel, body.quantity],
    );
    return getCart(client, req.get('x-cart-token'), req.user?.id || null);
  });
  res.status(201).json(result);
}));
api.patch('/cart/items/:id', asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ quantity: quantitySchema }), req.body);
  const result = await transaction(async (client) => {
    const cartId = await getOrCreateCartId(client, req.get('x-cart-token'), req.user?.id || null);
    const item = await client.query('SELECT ci.*, p.stock_on_hand, p.stock_reserved, p.min_order_qty FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.id=$1 AND ci.cart_id=$2', [req.params.id, cartId]);
    if (!item.rows[0]) fail(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
    const row = item.rows[0];
    if (body.quantity * row.pack_count > row.stock_on_hand - row.stock_reserved) fail(409, 'INSUFFICIENT_STOCK', 'The requested quantity is no longer available.');
    if (body.quantity < row.min_order_qty) fail(422, 'MOQ_NOT_MET', `The minimum order quantity for this product is ${row.min_order_qty}.`);
    const [anyTier, matchingTier] = await Promise.all([
      client.query('SELECT 1 FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE LIMIT 1',[row.product_id]),
      client.query('SELECT 1 FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE AND minimum_quantity <= $2 LIMIT 1',[row.product_id,body.quantity]),
    ]);
    if (anyTier.rowCount && !matchingTier.rowCount) fail(422,'TIER_NOT_CONFIGURED','No quantity price is configured for this product at that quantity.');
    await client.query('UPDATE cart_items SET quantity=$1 WHERE id=$2', [body.quantity, req.params.id]);
    return getCart(client, req.get('x-cart-token'), req.user?.id || null);
  });
  res.json(result);
}));
api.delete('/cart/items/:id', asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const cartId = await getOrCreateCartId(pool, req.get('x-cart-token'), req.user?.id || null);
  const result = await pool.query('DELETE FROM cart_items WHERE id=$1 AND cart_id=$2', [req.params.id, cartId]);
  if (!result.rowCount) fail(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  res.json(await getCart(pool, req.get('x-cart-token'), req.user?.id || null));
}));
api.delete('/cart', asyncRoute(async (req, res) => {
  const cartId = await getOrCreateCartId(pool, req.get('x-cart-token'), req.user?.id || null);
  await pool.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);
  res.status(204).end();
}));

}
