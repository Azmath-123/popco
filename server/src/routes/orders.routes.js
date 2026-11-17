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
api.get('/orders/:id', asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  const order = orderResult.rows[0];
  if (!order) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
  const owned = req.user?.id && req.user.id === order.customer_id;
  const admin = req.user?.role === 'admin';
  const guestVerified = !order.customer_id && req.get('x-guest-phone') && req.get('x-guest-phone') === order.customer_phone;
  if (!owned && !admin && !guestVerified) fail(403, 'FORBIDDEN', 'Order access could not be verified.');
  res.json(await getOrderDto(pool, order.id));
}));
api.get('/me/orders', requireAuth(), asyncRoute(async (req, res) => {
  const rows = await pool.query('SELECT id FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 100', [req.user.id]);
  res.json(await Promise.all(rows.rows.map((row) => getOrderDto(pool, row.id))));
}));

const cancelOrderHandler = asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ reason: z.string().trim().max(300).optional().default('Customer cancellation') }), req.body || {});
  const result = await transaction(async (client) => {
    const row = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    const order = row.rows[0];
    if (!order) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
    if (!(req.user?.role === 'admin' || (req.user?.id && req.user.id === order.customer_id))) fail(403, 'FORBIDDEN', 'This order cannot be cancelled by this session.');
    if (['Shipped', 'Delivered'].includes(order.order_status)) fail(422, 'CANCELLATION_NOT_ALLOWED', 'This order can no longer be cancelled.');
    if (order.order_status === 'Cancelled') return order;
    const reservations = await client.query("SELECT * FROM stock_reservations WHERE order_id=$1 AND status='active' FOR UPDATE", [order.id]);
    for (const reservation of reservations.rows) {
      await client.query('UPDATE products SET stock_reserved=stock_reserved-$1,updated_at=NOW() WHERE id=$2', [reservation.quantity, reservation.product_id]);
      await client.query("UPDATE stock_reservations SET status='released',released_at=NOW() WHERE id=$1", [reservation.id]);
      await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,reference_type,reference_id) VALUES ($1,$2,$3,$4,$5)', [reservation.product_id,reservation.quantity,'Cancelled order reservation release','order',order.id]);
    }
    if (order.payment_method === 'cod' && order.payment_status !== 'paid') {
      const lines = await client.query('SELECT product_id,SUM(pack_count*quantity)::int AS quantity FROM order_items WHERE order_id=$1 AND product_id IS NOT NULL GROUP BY product_id', [order.id]);
      for (const line of lines.rows) {
        await client.query('UPDATE products SET stock_on_hand=stock_on_hand+$1,updated_at=NOW() WHERE id=$2', [line.quantity,line.product_id]);
        await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,reference_type,reference_id) VALUES ($1,$2,$3,$4,$5)', [line.product_id,line.quantity,'Cancelled unpaid COD order restock','order',order.id]);
      }
    }
    if (order.customer_id && Number(order.m_coins_used) > 0 && order.payment_status !== 'paid') await client.query('UPDATE customers SET m_coins=m_coins+$1 WHERE id=$2', [order.m_coins_used, order.customer_id]);
    if (order.coupon_code && order.payment_method === 'cod' && order.payment_status !== 'paid') await client.query('UPDATE coupons SET usage_count=GREATEST(0,usage_count-1),updated_at=NOW() WHERE code=$1', [order.coupon_code]);
    const updated = await client.query("UPDATE orders SET order_status='Cancelled',updated_at=NOW() WHERE id=$1 RETURNING *", [order.id]);
    await enqueueNotification(client, updated.rows[0], 'cancelled', { reason: body.reason, refundStatus: order.payment_status === 'paid' ? 'refund required' : 'not applicable' });
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,before_state,after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [req.user?.id || null, 'order.cancelled', 'order', order.id, JSON.stringify({ status: order.order_status }), JSON.stringify({ status: 'Cancelled', reason: body.reason })]);
    return updated.rows[0];
  });
  if (['paid','refund_pending'].includes(result.payment_status)) {
    const payment = await pool.query('SELECT * FROM payments WHERE order_id=$1 AND status IN (\'captured\',\'authorized\',\'refund_pending\') ORDER BY created_at DESC LIMIT 1', [req.params.id]);
    if (payment.rows[0]) await requestRefund(req.params.id, payment.rows[0], Number(result.total), body.reason, req.user?.id || null);
  }
  res.json(await getOrderDto(pool, req.params.id));
});
api.post('/orders/:id/cancel', cancelOrderHandler);
api.post('/admin/orders/:id/cancel', adminOnly, cancelOrderHandler);


}
