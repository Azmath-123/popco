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
api.get('/admin/orders', adminOnly, asyncRoute(async (req, res) => {
  const status = req.query.status && req.query.status !== 'all' ? req.query.status : null;
  if (status && !['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled','Expired'].includes(status)) fail(400,'VALIDATION_ERROR','Order status filter is invalid.');
  const paymentStatus = req.query.payment_status || null;
  if (paymentStatus && !['pending','paid','failed','refunded','refund_pending'].includes(paymentStatus)) fail(400,'VALIDATION_ERROR','Payment status filter is invalid.');
  const bulkFlag = req.query.bulk_flag == null ? null : req.query.bulk_flag === 'true' ? true : req.query.bulk_flag === 'false' ? false : undefined;
  if (bulkFlag === undefined) fail(400,'VALIDATION_ERROR','Bulk order filter must be true or false.');
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime())) || (from && to && from > to)) fail(400,'VALIDATION_ERROR','Order date range is invalid.');
  const search = req.query.search ? `%${String(req.query.search).slice(0,100)}%` : null;
  const result = await pool.query("SELECT id FROM orders WHERE ($1::text IS NULL OR order_status=$1) AND ($2::text IS NULL OR payment_status=$2) AND ($3::boolean IS NULL OR bulk_order=$3) AND ($4::timestamptz IS NULL OR created_at >= $4) AND ($5::timestamptz IS NULL OR created_at < $5 + INTERVAL '1 day') AND ($6::text IS NULL OR order_number ILIKE $6 OR customer_name ILIKE $6 OR customer_phone ILIKE $6) ORDER BY created_at DESC LIMIT 200", [status,paymentStatus,bulkFlag,from,to,search]);
  res.json(await Promise.all(result.rows.map((row) => getOrderDto(pool, row.id))));
}));
api.get('/admin/orders/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const order = await getOrderDto(pool, req.params.id);
  if (!order) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
  res.json(order);
}));
api.patch('/admin/orders/:id/status', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ status: z.enum(['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled']), trackingNumber: z.string().trim().max(120).optional() }), req.body);
  const allowed = { Pending: ['Confirmed','Cancelled'], Confirmed: ['Processing','Shipped','Cancelled'], Processing: ['Shipped','Cancelled'], Shipped: ['Delivered'], Delivered: [], Cancelled: [] };
  const order = await transaction(async (client) => {
    const result = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    const current = result.rows[0];
    if (!current) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
    if (body.status === 'Cancelled') fail(422, 'USE_CANCEL_ENDPOINT', 'Use the cancellation endpoint so stock and refunds are handled safely.');
    if (current.order_status !== body.status && !allowed[current.order_status]?.includes(body.status)) fail(422, 'INVALID_STATUS_TRANSITION', `Cannot move order from ${current.order_status} to ${body.status}.`);
    if (body.status === 'Shipped' && current.payment_method === 'razorpay' && current.payment_status !== 'paid') fail(422, 'PAYMENT_REQUIRED', 'Only a verified paid order can be shipped.');
    const updated = await client.query("UPDATE orders SET order_status=$1,tracking_number=COALESCE($2,tracking_number),payment_status=CASE WHEN $1='Delivered' AND payment_method='cod' THEN 'paid' ELSE payment_status END,updated_at=NOW() WHERE id=$3 RETURNING *", [body.status,body.trackingNumber || null,req.params.id]);
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,before_state,after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [req.user.id,'order.status_changed','order',req.params.id,JSON.stringify({ status: current.order_status }),JSON.stringify({ status: body.status })]);
    if (body.status === 'Shipped' || body.status === 'Delivered') await enqueueNotification(client, updated.rows[0], body.status.toLowerCase(), { carrier: current.tracking_carrier, trackingNumber: current.tracking_number });
    return updated.rows[0];
  });
  res.json(await getOrderDto(pool, order.id));
}));
api.patch('/admin/orders/:id/shipping', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ courier_name: z.string().trim().max(120).optional(), tracking_number: z.string().trim().max(120).optional(), tracking_url: z.string().url().max(1000).optional().or(z.literal('')), delivery_status: z.enum(['Confirmed','Processing','Shipped','Delivered']).optional() }), req.body);
  const order = await transaction(async (client) => {
    const existing = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!existing.rows[0]) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
    const current = existing.rows[0];
    if (body.delivery_status && body.delivery_status !== current.order_status) {
      const allowed = { Pending: ['Confirmed'], Confirmed: ['Processing','Shipped'], Processing: ['Shipped'], Shipped: ['Delivered'], Delivered: [] };
      if (!allowed[current.order_status]?.includes(body.delivery_status)) fail(422, 'INVALID_STATUS_TRANSITION', 'This delivery status transition is not allowed.');
      if (body.delivery_status === 'Shipped' && current.payment_method === 'razorpay' && current.payment_status !== 'paid') fail(422, 'PAYMENT_REQUIRED', 'Only a verified paid order can be shipped.');
    }
    const updated = await client.query('UPDATE orders SET tracking_carrier=COALESCE($1,tracking_carrier),tracking_number=COALESCE($2,tracking_number),tracking_url=COALESCE($3,tracking_url),order_status=COALESCE($4,order_status),updated_at=NOW() WHERE id=$5 RETURNING *', [body.courier_name,body.tracking_number,body.tracking_url,body.delivery_status,req.params.id]);
    if (body.delivery_status === 'Shipped' || body.delivery_status === 'Delivered') await enqueueNotification(client, updated.rows[0], body.delivery_status.toLowerCase(), { carrier: body.courier_name, trackingNumber: body.tracking_number });
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [req.user.id,'order.shipping_updated','order',req.params.id,JSON.stringify(body)]);
    return updated.rows[0];
  });
  res.json(await getOrderDto(pool, order.id));
}));
api.post('/admin/orders/:id/refunds', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ amount: z.number().positive().optional(), reason: z.string().trim().max(300).optional().default('Admin refund') }), req.body || {});
  const result = await pool.query("SELECT o.*,p.id AS payment_record_id,p.gateway_payment_id FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id=$1 AND o.payment_status IN ('paid','refund_pending') AND p.status IN ('captured','refund_pending') ORDER BY p.created_at DESC LIMIT 1", [req.params.id]);
  if (!result.rows[0]) fail(422, 'ORDER_NOT_REFUNDABLE', 'A verified captured payment is required to refund this order.');
  const order = result.rows[0];
  const amount = body.amount || Number(order.total);
  if (amount > Number(order.total)) fail(422, 'INVALID_REFUND_AMOUNT', 'Refund amount cannot exceed the order total.');
  const refund = await requestRefund(order.id, { id: result.rows[0].payment_record_id, gateway_payment_id: result.rows[0].gateway_payment_id }, amount, body.reason, req.user.id);
  res.status(201).json(refund);
}));


}
