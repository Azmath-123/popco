import 'dotenv/config';
import nodemailer from 'nodemailer';
import { pool, transaction } from '../config/database.js';
import { verifyAndCaptureOrder } from '../modules/payments/payment.service.js';

function mailer() {
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !pass || !process.env.MAIL_FROM) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass },
  });
}

function notificationMessage(row) {
  const data = row.payload || {};
  const reference = data.orderNumber ? `Order ${data.orderNumber}` : 'PopCo Makhana';
  const subjects = {
    order_confirmation: `Order confirmed: ${reference}`,
    shipped: `Your order has shipped: ${reference}`,
    delivered: `Your order was delivered: ${reference}`,
    cancelled: `Order update: ${reference}`,
    contact_enquiry: 'New contact enquiry for PopCo Makhana',
    bulk_quote: `New Bulk Wholesale Quote Request: ${data.productName || 'Wholesale Products'} (${data.quantityKg || '50'} KG)`,
    refunded: `Refund update: ${reference}`,
  };
  if (row.event_type === 'bulk_quote') {
    return {
      subject: subjects.bulk_quote,
      text: `BULK WHOLESALE QUOTE REQUEST\n\nProduct: ${data.productName || 'Wholesale Products'}\nRequired Quantity: ${data.quantityKg || '50'} KG\nCustomer Name: ${data.name || 'Not provided'}\nPhone Number: ${data.phone || 'Not provided'}\nEmail: ${data.email || 'Not provided'}\n\nNotes / Requirement:\n${data.notes || 'Direct Wholesale Quote Enquiry'}`
    };
  }
  const body = row.event_type === 'contact_enquiry'
    ? `Enquiry ${data.enquiryId || ''}\nName: ${data.name || ''}\nEmail: ${data.email || ''}\nPhone: ${data.phone || ''}\n\n${data.message || ''}`
    : `${reference}\nEvent: ${row.event_type.replaceAll('_', ' ')}\n${data.amount != null ? `Total: INR ${data.amount}\n` : ''}${data.carrier ? `Courier: ${data.carrier}\n` : ''}${data.trackingNumber ? `Tracking: ${data.trackingNumber}\n` : ''}${data.reason ? `Reason: ${data.reason}\n` : ''}${data.refundStatus ? `Refund status: ${data.refundStatus}\n` : ''}`;
  return { subject: subjects[row.event_type] || `PopCo Makhana update: ${reference}`, text: body };
}

export async function processNotifications() {
  const transport = mailer();
  if (!transport) return;
  const claimed = await transaction(async (client) => {
    const rows = await client.query(
      `SELECT * FROM notification_outbox WHERE processed_at IS NULL AND next_attempt_at <= NOW()
       AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')
       ORDER BY created_at LIMIT 20 FOR UPDATE SKIP LOCKED`,
    );
    if (!rows.rowCount) return [];
    const ids = rows.rows.map((row) => row.id);
    await client.query('UPDATE notification_outbox SET locked_at=NOW(),attempts=attempts+1 WHERE id=ANY($1::uuid[])', [ids]);
    return rows.rows.map((row) => ({ ...row, attempts: row.attempts + 1 }));
  });
  for (const row of claimed) {
    try {
      const message = notificationMessage(row);
      const sent = await transport.sendMail({ from: process.env.MAIL_FROM, to: row.recipient, ...message });
      await transaction(async (client) => {
        await client.query('UPDATE notification_outbox SET processed_at=NOW(),locked_at=NULL WHERE id=$1', [row.id]);
        await client.query("INSERT INTO notification_logs (recipient,event_type,order_id,status,provider_reference,sent_at) VALUES ($1,$2,$3,'sent',$4,NOW())", [row.recipient,row.event_type,row.order_id,sent.messageId || null]);
      });
    } catch (error) {
      const finalAttempt = row.attempts >= 6;
      await transaction(async (client) => {
        await client.query('UPDATE notification_outbox SET locked_at=NULL,processed_at=CASE WHEN $2 THEN NOW() ELSE NULL END,next_attempt_at=NOW()+($3::text || \' seconds\')::interval WHERE id=$1', [row.id,finalAttempt,Math.min(3600,30 * (2 ** row.attempts))]);
        await client.query('INSERT INTO notification_logs (recipient,event_type,order_id,status,error) VALUES ($1,$2,$3,$4,$5)', [row.recipient,row.event_type,row.order_id,finalAttempt ? 'failed' : 'retrying',String(error.message).slice(0,500)]);
      });
      console.error(JSON.stringify({ event: 'notification.failed', eventType: row.event_type, error: String(error.message).slice(0,300) }));
    }
  }
}

async function releaseReservation(reservationId) {
  await transaction(async (client) => {
    const result = await client.query('SELECT sr.*,o.customer_id,o.order_status,o.payment_status,o.id AS order_id FROM stock_reservations sr JOIN orders o ON o.id=sr.order_id WHERE sr.id=$1 FOR UPDATE OF sr,o', [reservationId]);
    const reservation = result.rows[0];
    if (!reservation || reservation.status !== 'active' || new Date(reservation.expires_at) > new Date()) return;
    const payment = await client.query("SELECT status FROM payments WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [reservation.order_id]);
    if (payment.rows[0] && ['authorized', 'captured', 'refund_pending'].includes(payment.rows[0].status)) return;
    await client.query('UPDATE products SET stock_reserved=stock_reserved-$1,updated_at=NOW() WHERE id=$2 AND stock_reserved >= $1', [reservation.quantity,reservation.product_id]);
    await client.query("UPDATE stock_reservations SET status='expired',released_at=NOW() WHERE id=$1 AND status='active'", [reservation.id]);
    await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,reference_type,reference_id) VALUES ($1,$2,$3,$4,$5)', [reservation.product_id,reservation.quantity,'Expired payment reservation','order',reservation.order_id]);
    await client.query("UPDATE orders SET order_status='Expired',reservation_released_at=NOW(),updated_at=NOW() WHERE id=$1", [reservation.order_id]);
  });
}

export async function processExpiredReservations() {
  const candidates = await pool.query(
    `SELECT sr.id,sr.expires_at,(SELECT p.gateway_order_id FROM payments p WHERE p.order_id=sr.order_id ORDER BY p.created_at DESC LIMIT 1) AS gateway_order_id FROM stock_reservations sr
     WHERE sr.status='active' AND sr.expires_at <= NOW()
     ORDER BY sr.expires_at LIMIT 50`,
  );
  for (const reservation of candidates.rows) {
    if (reservation.gateway_order_id) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) continue;
      try {
        const { default: Razorpay } = await import('razorpay');
        const client = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        const payments = await client.orders.fetchPayments(reservation.gateway_order_id);
        const captured = payments.items?.find((payment) => payment.status === 'captured');
        if (captured) {
          const paymentRow = await pool.query('SELECT order_id FROM payments WHERE gateway_order_id=$1', [reservation.gateway_order_id]);
          if (paymentRow.rows[0]) await transaction((tx) => verifyAndCaptureOrder(tx, paymentRow.rows[0].order_id, captured));
          continue;
        }
        if (payments.items?.some((payment) => payment.status === 'authorized')) continue;
      } catch (error) {
        console.error(JSON.stringify({ event: 'reservation.reconcile_failed', reservationId: reservation.id, error: String(error.message).slice(0,300) }));
        continue;
      }
    }
    await releaseReservation(reservation.id);
  }
}

export function startBackgroundJobs() {
  const run = () => Promise.allSettled([processExpiredReservations(), processNotifications()]).then((results) => {
    for (const result of results) if (result.status === 'rejected') console.error(JSON.stringify({ event: 'background_job.failed', error: String(result.reason?.message || result.reason).slice(0,300) }));
  });
  const timer = setInterval(run, 60_000);
  timer.unref();
  run();
  return timer;
}
