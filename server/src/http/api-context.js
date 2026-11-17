import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { pool, transaction } from '../config/database.js';
import { clearSessionCookie, createAccessToken, hashPassword, hashToken, optionalAuth, requireAuth, safeEqual, setSessionCookie, verifyPassword } from '../middleware/authentication.js';
import { verifyAndCaptureOrder } from '../modules/payments/payment.service.js';
import { INITIAL_PRODUCTS } from '../seed/catalog-data.js';

const app = express();
const api = express.Router();
const v1 = '/api/v1';
const frontendIndex = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../client/dist/index.html');
const adminOnly = requireAuth(['admin']);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const publicFormLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false });

class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const fail = (status, code, message, details) => { throw new HttpError(status, code, message, details); };
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) fail(400, 'VALIDATION_ERROR', 'Please check the submitted fields.', result.error.issues.map((issue) => ({ field: issue.path.join('.'), issue: issue.message })));
  return result.data;
};
const moneyCents = (value) => Math.round(Number(value || 0) * 100);
const fromCents = (value) => (value / 100).toFixed(2);
const asNumber = (value) => Number(value || 0);
const cleanEmail = (email) => email.trim().toLowerCase();
const idSchema = z.string().uuid();
const quantitySchema = z.number().int().positive().max(100000);
const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(30),
    address: z.string().trim().min(4).max(300),
    addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pincode: z.string().trim().min(4).max(12),
  }),
  items: z.array(z.object({
    productId: z.string().uuid(),
    selectedPack: z.object({ count: quantitySchema, label: z.string().trim().min(1).max(80) }).passthrough(),
    quantity: quantitySchema,
  })).min(1).max(100),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().trim().max(64).optional().nullable(),
  mCoinsUsed: z.number().int().nonnegative().optional().default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  gstin: z.string().trim().max(20).optional().or(z.literal('')),
});

function userDto(row, addresses = []) {
  if (!row) return null;
  return {
    uid: row.id,
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role === 'admin' ? 'super_admin' : 'customer',
    mCoins: row.m_coins,
    joinedDate: new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    addresses,
  };
}

function addressDto(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2 || '',
    city: row.city,
    state: row.state,
    pincode: row.postal_code,
    isDefault: row.is_default,
  };
}

function availableProductPacks(product) {
  const packs = product.product_data?.packs;
  if (Array.isArray(packs) && packs.length > 0) return packs;
  return [{ count: 1, label: 'Single Pack', price: Number(product.base_price) }];
}

function productDto(row, tiers = []) {
  const data = row.product_data || {};
  const base = Number(row.base_price);
  const stockAvailable = Math.max(0, Number(row.stock_on_hand) - Number(row.stock_reserved));
  return {
    ...data,
    packs: availableProductPacks(row),
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    category: row.category,
    numericPrice: base,
    price: `₹${base}`,
    stockCount: stockAvailable,
    inStock: row.status === 'active' && stockAvailable > 0,
    isActive: row.status === 'active',
    minOrderQty: Number(row.min_order_qty),
    bulkTiers: tiers.map((tier) => ({ minimumQuantity: Number(tier.minimum_quantity), unitPrice: Number(tier.unit_price) })),
  };
}

async function productWithTiers(client, row) {
  const result = await client.query('SELECT minimum_quantity, unit_price FROM bulk_price_tiers WHERE product_id = $1 AND is_active = TRUE ORDER BY minimum_quantity', [row.id]);
  return productDto(row, result.rows);
}

async function listProductDtos(query = pool) {
  const rows = await query.query("SELECT * FROM products WHERE status = 'active' ORDER BY COALESCE((product_data->>'isFeatured')::boolean, FALSE) DESC, name ASC");
  return Promise.all(rows.rows.map((row) => productWithTiers(query, row)));
}

function couponDto(row) {
  return {
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrder: Number(row.min_order),
    maxDiscount: row.max_discount == null ? undefined : Number(row.max_discount),
    description: row.description,
    active: row.active,
    usageCount: row.usage_count,
  };
}

function orderStatusForUi(status) {
  if (status === 'Expired') return 'Cancelled';
  return status;
}

function orderDto(order, items = []) {
  const address = [order.address_line_1, order.address_line_2].filter(Boolean).join(', ');
  return {
    id: order.id,
    orderNumber: order.order_number,
    date: new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: new Date(order.created_at).getTime(),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      product: item.product_snapshot,
      selectedPack: { count: Number(item.pack_count), label: item.pack_label, price: Number(item.unit_price) },
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address,
      city: order.city,
      state: order.state,
      pincode: order.postal_code,
      gstin: order.gstin || undefined,
    },
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    couponCode: order.coupon_code || undefined,
    mCoinsUsed: Number(order.m_coins_used),
    mCoinsDiscount: Number(order.m_coins_discount),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: orderStatusForUi(order.order_status),
    trackingNumber: order.tracking_number || undefined,
    trackingCarrier: order.tracking_carrier || undefined,
    trackingUrl: order.tracking_url || undefined,
    notes: order.notes || undefined,
    bulkOrder: order.bulk_order,
  };
}

async function getOrderDto(query, orderId) {
  const result = await query.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = result.rows[0];
  if (!order) return null;
  const lines = await query.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [orderId]);
  return orderDto(order, lines.rows);
}

async function getStoreSettings(query = pool) {
  const result = await query.query("SELECT value FROM store_settings WHERE key = 'store'");
  return result.rows[0]?.value || {};
}

async function getCart(query, token, customerId = null) {
  if (!token || token.length < 20 || token.length > 100) return { items: [], subtotal: 0, comboDiscount: 0 };
  const cartResult = await query.query(
    `INSERT INTO carts (cart_token, customer_id) VALUES ($1, $2)
     ON CONFLICT (cart_token) DO UPDATE SET customer_id = COALESCE(EXCLUDED.customer_id, carts.customer_id), updated_at = NOW()
     RETURNING id`, [token, customerId],
  );
  const rows = await query.query(
    `SELECT ci.id AS cart_item_id, ci.product_id, ci.pack_count, ci.pack_label, ci.quantity, p.*
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1 AND p.status = 'active' ORDER BY ci.created_at`, [cartResult.rows[0].id],
  );
  const items = await Promise.all(rows.rows.map(async (row) => {
    const product = productDto(row);
    const selectedPack = (product.packs || []).find((pack) => Number(pack.count) === Number(row.pack_count)) || { count: Number(row.pack_count), label: row.pack_label, price: product.numericPrice };
    const tier = await query.query('SELECT unit_price FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE AND minimum_quantity <= $2 ORDER BY minimum_quantity DESC LIMIT 1', [row.product_id, row.quantity]);
    if (tier.rows[0]) selectedPack.price = Number(tier.rows[0].unit_price);
    return { id: row.cart_item_id, productId: row.product_id, product, selectedPack, quantity: Number(row.quantity) };
  }));
  const grossSubtotal = items.reduce((sum, item) => sum + Number(item.selectedPack.price || item.product.numericPrice) * item.quantity, 0);
  const unitPrices = [];
  for (const item of items) {
    if (Number(item.selectedPack?.count) === 1) {
      const price = Number(item.selectedPack.price || item.product.numericPrice || 0);
      for (let i = 0; i < Number(item.quantity || 0); i++) {
        unitPrices.push(price);
      }
    }
  }
  const numCombos = Math.floor(unitPrices.length / 10);
  unitPrices.sort((a, b) => b - a);
  let comboDiscount = 0;
  for (let c = 0; c < numCombos; c++) {
    const comboUnits = unitPrices.slice(c * 10, (c + 1) * 10);
    const gross = comboUnits.reduce((sum, p) => sum + p, 0);
    comboDiscount += Math.max(0, gross - 1799);
  }
  return { items, subtotal: Math.max(0, grossSubtotal - comboDiscount), comboDiscount };
}

async function getOrCreateCartId(query, token, customerId = null) {
  if (!token || token.length < 20 || token.length > 100) fail(400, 'CART_TOKEN_REQUIRED', 'A valid cart token is required.');
  const result = await query.query(
    `INSERT INTO carts (cart_token, customer_id) VALUES ($1, $2)
     ON CONFLICT (cart_token) DO UPDATE SET customer_id = COALESCE(EXCLUDED.customer_id, carts.customer_id), updated_at = NOW()
     RETURNING id`, [token, customerId],
  );
  return result.rows[0].id;
}

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) fail(503, 'PAYMENT_NOT_CONFIGURED', 'Online payment is not configured yet. Please contact the store.');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

async function enqueueNotification(client, order, eventType, payload = {}) {
  if (!order.customer_email) return;
  await client.query('INSERT INTO notification_outbox (recipient, event_type, order_id, payload) VALUES ($1, $2, $3, $4::jsonb)', [order.customer_email, eventType, order.id, JSON.stringify({ orderNumber: order.order_number, ...payload })]);
}


async function requestRefund(orderId, payment, amount, reason, actorId) {
  const duplicate = await pool.query("SELECT * FROM refunds WHERE order_id=$1 AND status IN ('pending','processed') ORDER BY created_at DESC LIMIT 1", [orderId]);
  if (duplicate.rows[0]) return duplicate.rows[0];
  if (!payment.gateway_payment_id) fail(422, 'PAYMENT_REFERENCE_MISSING', 'The original payment reference is missing.');
  const row = await pool.query('INSERT INTO refunds (order_id,payment_id,amount,reason) VALUES ($1,$2,$3,$4) RETURNING *', [orderId, payment.id, amount.toFixed(2), reason]);
  await pool.query("UPDATE payments SET status='refund_pending',updated_at=NOW() WHERE id=$1", [payment.id]);
  await pool.query("UPDATE orders SET payment_status='refund_pending',updated_at=NOW() WHERE id=$1", [orderId]);
  let refund;
  try {
    refund = await getRazorpay().payments.refund(payment.gateway_payment_id, { amount: moneyCents(amount), notes: { orderId, reason } });
  } catch (error) {
    await pool.query("UPDATE refunds SET status='failed',updated_at=NOW() WHERE id=$1", [row.rows[0].id]);
    throw error;
  }
  await pool.query("UPDATE refunds SET gateway_refund_id=$1,status=$2,updated_at=NOW() WHERE id=$3", [refund.id, refund.status === 'processed' ? 'processed' : 'pending', row.rows[0].id]);
  if (refund.status === 'processed') {
    await transaction(async (client) => {
      await client.query("UPDATE payments SET status='refunded',updated_at=NOW() WHERE id=$1", [payment.id]);
      const completed = await client.query("UPDATE orders SET payment_status='refunded',updated_at=NOW() WHERE id=$1 AND payment_status <> 'refunded' RETURNING id,customer_id,m_coins_used,customer_email,order_number,total", [orderId]);
      if (completed.rows[0]?.customer_id && Number(completed.rows[0].m_coins_used) > 0) await client.query('UPDATE customers SET m_coins=m_coins+$1 WHERE id=$2', [completed.rows[0].m_coins_used,completed.rows[0].customer_id]);
      if (completed.rows[0]) {
        await enqueueNotification(client, completed.rows[0], 'refunded', { refundId: refund.id, refundAmount: amount });
        await client.query("UPDATE refunds SET status='processed',updated_at=NOW() WHERE id=$1", [row.rows[0].id]);
      }
    });
  }
  await pool.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [actorId, 'refund.requested', 'order', orderId, JSON.stringify({ refundId: refund.id, amount })]);
  return refund;
}

export const routeContext = {
  app, api, v1, frontendIndex, adminOnly, authLimiter, publicFormLimiter, checkoutLimiter,
  HttpError, fail, asyncRoute, parse, moneyCents, fromCents, asNumber, cleanEmail,
  idSchema, quantitySchema, checkoutSchema, userDto, addressDto, availableProductPacks,
  productDto, productWithTiers, listProductDtos, couponDto, orderStatusForUi, orderDto,
  getOrderDto, getStoreSettings, getCart, getOrCreateCartId, getRazorpay, enqueueNotification,
  pool, transaction, clearSessionCookie, createAccessToken, hashPassword, hashToken,
  optionalAuth, requireAuth, safeEqual, setSessionCookie, verifyPassword,
  verifyAndCaptureOrder, INITIAL_PRODUCTS, crypto, fs, path, fileURLToPath, express,
  cors, helmet, cookieParser, rateLimit, z, Razorpay, requestRefund,
};

export { app, api, v1, frontendIndex, asyncRoute, optionalAuth, pool };
