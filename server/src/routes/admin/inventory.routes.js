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
api.get('/admin/inventory', adminOnly, asyncRoute(async (req, res) => {
  const low = req.query.low_stock === 'true';
  const result = await pool.query(`SELECT id,name,sku,stock_on_hand,stock_reserved,low_stock_threshold,updated_at FROM products WHERE status='active' AND ($1::boolean = FALSE OR stock_on_hand-stock_reserved <= low_stock_threshold) ORDER BY name`, [low]);
  res.json(result.rows.map((row) => ({ id: row.id, name: row.name, sku: row.sku, onHand: row.stock_on_hand, reserved: row.stock_reserved, available: row.stock_on_hand-row.stock_reserved, lowStockThreshold: row.low_stock_threshold, lowStock: row.stock_on_hand-row.stock_reserved <= row.low_stock_threshold, updatedAt: row.updated_at })));
}));
api.patch('/admin/inventory/:item_id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.item_id);
  const body = parse(z.object({ quantity_delta: z.number().int().min(-100000).max(100000).refine((v) => v !== 0), reason: z.string().trim().min(3).max(300) }), req.body);
  const row = await transaction(async (client) => {
    const product = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [req.params.item_id]);
    if (!product.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    const available = product.rows[0].stock_on_hand + body.quantity_delta;
    if (available < product.rows[0].stock_reserved) fail(409, 'RESERVED_STOCK_CONFLICT', 'Stock cannot be reduced below active reservations.');
    const result = await client.query('UPDATE products SET stock_on_hand=stock_on_hand+$1,updated_at=NOW() WHERE id=$2 RETURNING *', [body.quantity_delta,req.params.item_id]);
    await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,actor_id) VALUES ($1,$2,$3,$4)', [req.params.item_id,body.quantity_delta,body.reason,req.user.id]);
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [req.user.id,'inventory.adjusted','product',req.params.item_id,JSON.stringify({ delta: body.quantity_delta, reason: body.reason })]);
    return result.rows[0];
  });
  res.json({ id: row.id, onHand: row.stock_on_hand, reserved: row.stock_reserved, available: row.stock_on_hand-row.stock_reserved });
}));
api.get('/admin/inventory/movements', adminOnly, asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT im.*,p.name,p.sku,c.full_name AS actor FROM inventory_movements im JOIN products p ON p.id=im.product_id LEFT JOIN customers c ON c.id=im.actor_id ORDER BY im.created_at DESC LIMIT 200');
  res.json(result.rows);
}));


}
