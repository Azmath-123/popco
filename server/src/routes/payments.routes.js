import crypto from 'node:crypto';
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
api.post('/orders/:id/payment-session', checkoutLimiter, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const orderResult = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  const order = orderResult.rows[0];
  if (!order) fail(404, 'ORDER_NOT_FOUND', 'Order not found.');
  if (!((req.user && req.user.id === order.customer_id) || (!order.customer_id && req.get('x-guest-phone') === order.customer_phone))) fail(403, 'FORBIDDEN', 'This order cannot be accessed by this session.');
  if (order.payment_method !== 'razorpay' || order.order_status !== 'Pending' || order.payment_status !== 'pending') fail(422, 'ORDER_NOT_PAYABLE', 'This order cannot be paid in its current state.');
  if (new Date(order.reservation_expires_at) <= new Date()) fail(409, 'RESERVATION_EXPIRED', 'This order reservation has expired.');
  const existingPayment = await pool.query('SELECT gateway_order_id FROM payments WHERE order_id=$1 AND gateway_order_id IS NOT NULL', [order.id]);
  if (existingPayment.rows[0]) return res.json({ keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: existingPayment.rows[0].gateway_order_id, amount: moneyCents(order.total), currency: 'INR', orderId: order.id, orderNumber: order.order_number });
  const razorpay = getRazorpay();
  const gatewayOrder = await razorpay.orders.create({ amount: moneyCents(order.total), currency: 'INR', receipt: order.order_number, notes: { orderId: order.id } });
  await pool.query('INSERT INTO payments (order_id,gateway_order_id,amount,currency,status) VALUES ($1,$2,$3,\'INR\',\'created\')', [order.id, gatewayOrder.id, order.total]);
  res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: gatewayOrder.id, amount: gatewayOrder.amount, currency: 'INR', orderId: order.id, orderNumber: order.order_number });
}));

api.post('/payments/razorpay/verify', checkoutLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ orderId: z.string().uuid(), razorpay_order_id: z.string().min(1), razorpay_payment_id: z.string().min(1), razorpay_signature: z.string().min(1) }), req.body);
  if (!process.env.RAZORPAY_KEY_SECRET) fail(503, 'PAYMENT_NOT_CONFIGURED', 'Online payment verification is not configured.');
  const paymentRow = await pool.query('SELECT p.*,o.customer_id,o.customer_phone,o.order_status FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.order_id=$1 AND p.gateway_order_id=$2', [body.orderId, body.razorpay_order_id]);
  if (!paymentRow.rows[0]) fail(404, 'PAYMENT_NOT_FOUND', 'Payment session not found.');
  const payment = paymentRow.rows[0];
  if (!((req.user && req.user.id === payment.customer_id) || (!payment.customer_id && req.get('x-guest-phone') === payment.customer_phone))) fail(403, 'FORBIDDEN', 'This payment cannot be verified by this session.');
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest('hex');
  if (!safeEqual(expected, body.razorpay_signature)) fail(401, 'INVALID_PAYMENT_SIGNATURE', 'The payment signature could not be verified.');
  const gatewayPayment = await getRazorpay().payments.fetch(body.razorpay_payment_id);
  if (gatewayPayment.order_id !== body.razorpay_order_id || gatewayPayment.status !== 'captured') fail(422, 'PAYMENT_NOT_CAPTURED', 'Razorpay has not confirmed this payment.');
  await transaction((client) => verifyAndCaptureOrder(client, body.orderId, { id: gatewayPayment.id, amount: gatewayPayment.amount, currency: gatewayPayment.currency, status: gatewayPayment.status }));
  res.json(await getOrderDto(pool, body.orderId));
}));

api.post('/webhooks/razorpay', asyncRoute(async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) fail(503, 'WEBHOOK_NOT_CONFIGURED', 'Webhook verification is not configured.');
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const supplied = req.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (!safeEqual(expected, supplied)) fail(401, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature is invalid.');
  const payload = JSON.parse(rawBody.toString('utf8'));
  const eventId = req.get('x-razorpay-event-id') || hashToken(rawBody.toString('hex'));
  const eventType = payload.event || 'unknown';
  const inserted = await pool.query('INSERT INTO webhook_events (event_id,event_type,payload) VALUES ($1,$2,$3::jsonb) ON CONFLICT (event_id) DO UPDATE SET payload=EXCLUDED.payload WHERE webhook_events.processed_at IS NULL RETURNING event_id', [eventId, eventType, JSON.stringify(payload)]);
  if (!inserted.rowCount) return res.json({ received: true, duplicate: true });
  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    const gatewayPayment = payload.payload?.payment?.entity;
    if (gatewayPayment?.order_id && gatewayPayment?.id) {
      const paymentResult = await pool.query('SELECT order_id FROM payments WHERE gateway_order_id=$1', [gatewayPayment.order_id]);
      if (paymentResult.rows[0]) await transaction((client) => verifyAndCaptureOrder(client, paymentResult.rows[0].order_id, { id: gatewayPayment.id, amount: gatewayPayment.amount, currency: gatewayPayment.currency, status: gatewayPayment.status }));
    }
  }
  if (eventType === 'payment.failed') {
    const gatewayPayment = payload.payload?.payment?.entity;
    if (gatewayPayment?.order_id) {
      await pool.query("UPDATE payments SET status='failed',raw_event=$1::jsonb,updated_at=NOW() WHERE gateway_order_id=$2 AND status <> 'captured'", [JSON.stringify(gatewayPayment), gatewayPayment.order_id]);
    }
  }
  if (eventType === 'refund.processed') {
    const refund = payload.payload?.refund?.entity;
    if (refund?.id) {
      await transaction(async (client) => {
        const refundRow = await client.query("UPDATE refunds SET status='processed',updated_at=NOW() WHERE gateway_refund_id=$1 RETURNING order_id,payment_id", [refund.id]);
        if (!refundRow.rows[0]) return;
        await client.query("UPDATE payments SET status='refunded',updated_at=NOW() WHERE id=$1", [refundRow.rows[0].payment_id]);
        const order = await client.query("UPDATE orders SET payment_status='refunded',updated_at=NOW() WHERE id=$1 AND payment_status <> 'refunded' RETURNING id,customer_id,m_coins_used,customer_email,order_number,total", [refundRow.rows[0].order_id]);
        if (order.rows[0]?.customer_id && Number(order.rows[0].m_coins_used) > 0) await client.query('UPDATE customers SET m_coins=m_coins+$1 WHERE id=$2', [order.rows[0].m_coins_used,order.rows[0].customer_id]);
        if (order.rows[0]) await enqueueNotification(client, order.rows[0], 'refunded', { refundId: refund.id, refundAmount: Number(refund.amount || 0) / 100 });
      });
    }
  }
  await pool.query('UPDATE webhook_events SET processed_at=NOW() WHERE event_id=$1', [eventId]);
  res.json({ received: true });
}));


}
