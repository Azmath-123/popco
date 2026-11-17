import { pool } from '../../config/database.js';

const cents = (value) => Math.round(Number(value || 0) * 100);
const rupees = (value) => (value / 100).toFixed(2);

export async function verifyAndCaptureOrder(client, orderId, payment) {
  const lockedOrder = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
  const order = lockedOrder.rows[0];
  if (!order) {
    const error = new Error('Order not found.');
    error.status = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }
  if (payment.currency !== 'INR' || Number(payment.amount) !== cents(order.total)) {
    const error = new Error('The payment amount or currency does not match this order.');
    error.status = 422;
    error.code = 'PAYMENT_AMOUNT_MISMATCH';
    throw error;
  }
  if (order.payment_status === 'paid') return order;
  if (order.reservation_released_at) {
    const error = new Error('This payment reservation has expired.');
    error.status = 409;
    error.code = 'RESERVATION_EXPIRED';
    throw error;
  }
  if (payment.status && payment.status !== 'captured') {
    const error = new Error('Razorpay has not confirmed this payment.');
    error.status = 422;
    error.code = 'PAYMENT_NOT_CAPTURED';
    throw error;
  }
  const reservationRows = await client.query("SELECT * FROM stock_reservations WHERE order_id = $1 AND status = 'active' FOR UPDATE", [orderId]);
  for (const reservation of reservationRows.rows) {
    const updated = await client.query(
      `UPDATE products SET stock_on_hand = stock_on_hand - $1, stock_reserved = stock_reserved - $1, updated_at = NOW()
       WHERE id = $2 AND stock_on_hand >= $1 AND stock_reserved >= $1 RETURNING id`,
      [reservation.quantity, reservation.product_id],
    );
    if (!updated.rowCount) {
      const error = new Error('Inventory could not be committed. Contact support.');
      error.status = 409;
      error.code = 'INVENTORY_CONFLICT';
      throw error;
    }
    await client.query("UPDATE stock_reservations SET status = 'committed', released_at = NOW() WHERE id = $1", [reservation.id]);
    await client.query('INSERT INTO inventory_movements (product_id, quantity_delta, reason, reference_type, reference_id) VALUES ($1, $2, $3, $4, $5)', [reservation.product_id, -reservation.quantity, 'Paid order stock commit', 'order', orderId]);
  }
  await client.query("UPDATE payments SET gateway_payment_id = $1, amount = $2, currency = 'INR', status = 'captured', signature_verified = TRUE, raw_event = $3::jsonb, paid_at = NOW(), updated_at = NOW() WHERE order_id = $4", [payment.id, rupees(payment.amount), JSON.stringify(payment), orderId]);
  await client.query("UPDATE orders SET payment_status = 'paid', order_status = 'Confirmed', reservation_released_at = NULL, updated_at = NOW() WHERE id = $1", [orderId]);
  if (order.coupon_code) await client.query('UPDATE coupons SET usage_count=usage_count+1,updated_at=NOW() WHERE code=$1', [order.coupon_code]);
  if (order.customer_id && !order.m_coins_awarded) {
    const reward = Math.round(Number(order.total) * 0.05);
    if (reward > 0) await client.query('UPDATE customers SET m_coins = m_coins + $1, updated_at = NOW() WHERE id = $2', [reward, order.customer_id]);
    await client.query('UPDATE orders SET m_coins_awarded=TRUE WHERE id=$1',[orderId]);
  }
  if (order.customer_email) {
    await client.query('INSERT INTO notification_outbox (recipient, event_type, order_id, payload) VALUES ($1, $2, $3, $4::jsonb)', [order.customer_email, 'order_confirmation', orderId, JSON.stringify({ orderNumber: order.order_number, amount: Number(order.total) })]);
  }
  return order;
}

export async function findPaymentOrder(paymentOrderId) {
  const result = await pool.query('SELECT order_id FROM payments WHERE gateway_order_id=$1', [paymentOrderId]);
  return result.rows[0]?.order_id || null;
}
