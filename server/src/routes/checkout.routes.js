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
api.post('/checkout/validate', checkoutLimiter, asyncRoute(async (req, res) => {
  const body = parse(checkoutSchema, { ...req.body, paymentMethod: req.body.paymentMethod || 'razorpay' });
  const validation = await validateOrder(body, req.user || null);
  res.json({
    subtotal: fromCents(validation.subtotalCents),
    comboDiscount: fromCents(validation.comboDiscountCents),
    couponDiscount: fromCents(validation.couponDiscountCents),
    mCoinsDiscount: fromCents(validation.coinsCents),
    shipping: fromCents(validation.shippingCents),
    tax: '0.00',
    total: fromCents(validation.totalCents),
    currency: 'INR',
    items: validation.lines.map(({ item, product, unitPriceCents }) => ({ productId: product.id, name: product.name, quantity: item.quantity, unitPrice: fromCents(unitPriceCents), lineTotal: fromCents(unitPriceCents * item.quantity) })),
  });
}));

async function validateOrder(body, user, query = pool, lockProducts = false) {
  let subtotalCents = 0;
  const lines = [];
  const sortedItems = [...body.items].sort((a, b) => a.productId.localeCompare(b.productId) || a.selectedPack.count - b.selectedPack.count);
  const products = new Map();
  const requiredByProduct = new Map();
  for (const item of sortedItems) {
    let product = products.get(item.productId);
    if (!product) {
      const result = await query.query(`SELECT * FROM products WHERE id=$1 AND status='active' ${lockProducts ? 'FOR UPDATE' : ''}`, [item.productId]);
      product = result.rows[0];
      if (product) products.set(item.productId, product);
    }
    if (!product) fail(422, 'PRODUCT_UNAVAILABLE', 'A product in your cart is no longer available.');
    const pack = availableProductPacks(product).find((option) => Number(option.count) === Number(item.selectedPack.count));
    if (!pack) fail(422, 'INVALID_VARIANT', 'A selected product pack is no longer available.');
    const tiers = await query.query('SELECT minimum_quantity, unit_price FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE AND minimum_quantity <= $2 ORDER BY minimum_quantity DESC LIMIT 1', [product.id, item.quantity]);
    if (item.quantity < product.min_order_qty) fail(422, 'MOQ_NOT_MET', `The minimum order quantity for ${product.name} is ${product.min_order_qty}.`);
    const anyTiers = await query.query('SELECT 1 FROM bulk_price_tiers WHERE product_id=$1 AND is_active=TRUE LIMIT 1', [product.id]);
    if (anyTiers.rowCount && !tiers.rowCount) fail(422, 'TIER_NOT_CONFIGURED', `No quantity price is configured for ${product.name} at this quantity.`);
    const unitPriceCents = tiers.rowCount ? moneyCents(tiers.rows[0].unit_price) : moneyCents(pack.price || product.base_price);
    const requiredStock = item.quantity * Number(pack.count);
    requiredByProduct.set(product.id, (requiredByProduct.get(product.id) || 0) + requiredStock);
    subtotalCents += unitPriceCents * item.quantity;
    lines.push({ item, product, pack, unitPriceCents, requiredStock, appliedTierQuantity: tiers.rows[0]?.minimum_quantity || null });
  }
  for (const [productId, quantity] of requiredByProduct) {
    const product = products.get(productId);
    if (quantity > Number(product.stock_on_hand) - Number(product.stock_reserved)) fail(409, 'INSUFFICIENT_STOCK', `There are not enough units of ${product.name} available.`);
  }
  const unitPricesCents = [];
  for (const line of lines) {
    if (Number(line.pack.count) === 1) {
      for (let i = 0; i < Number(line.item.quantity || 0); i++) {
        unitPricesCents.push(line.unitPriceCents);
      }
    }
  }
  const numCombos = Math.floor(unitPricesCents.length / 10);
  unitPricesCents.sort((a, b) => b - a);
  let comboDiscountCents = 0;
  for (let c = 0; c < numCombos; c++) {
    const comboUnits = unitPricesCents.slice(c * 10, (c + 1) * 10);
    const grossCents = comboUnits.reduce((sum, p) => sum + p, 0);
    comboDiscountCents += Math.max(0, grossCents - 179900);
  }
  const discountableSubtotalCents = Math.max(0, subtotalCents - comboDiscountCents);
  let couponDiscountCents = 0;
  let coupon = null;
  if (body.couponCode) {
    const result = await query.query('SELECT * FROM coupons WHERE code=$1 AND active=TRUE', [body.couponCode.trim().toUpperCase()]);
    coupon = result.rows[0];
    if (!coupon) fail(422, 'INVALID_COUPON', 'This coupon is no longer active.');
    if (discountableSubtotalCents < moneyCents(coupon.min_order)) fail(422, 'COUPON_MINIMUM_NOT_MET', `This coupon requires a minimum cart value of ₹${coupon.min_order}.`);
    couponDiscountCents = coupon.discount_type === 'percentage' ? Math.round(discountableSubtotalCents * Number(coupon.discount_value) / 100) : moneyCents(coupon.discount_value);
    if (coupon.max_discount != null) couponDiscountCents = Math.min(couponDiscountCents, moneyCents(coupon.max_discount));
    couponDiscountCents = Math.min(couponDiscountCents, discountableSubtotalCents);
  }
  const userCoins = user ? Number(user.m_coins) : 0;
  const coinsCents = Math.min(body.mCoinsUsed * 100, userCoins * 100, Math.max(0, discountableSubtotalCents - couponDiscountCents));
  const setting = await getStoreSettings(query);
  const shippingCents = discountableSubtotalCents === 0 || discountableSubtotalCents >= moneyCents(setting.freeShippingThreshold ?? 599) ? 0 : moneyCents(setting.standardShippingFee ?? 60);
  const totalCents = Math.max(0, discountableSubtotalCents - couponDiscountCents - coinsCents + shippingCents);
  return { lines, coupon, subtotalCents, comboDiscountCents, couponDiscountCents, coinsCents, shippingCents, totalCents };
}

api.post('/orders', checkoutLimiter, asyncRoute(async (req, res) => {
  const body = parse(checkoutSchema, { ...req.body, paymentMethod: req.body.paymentMethod || 'razorpay' });
  const key = req.get('idempotency-key') || crypto.randomUUID();
  if (!/^[A-Za-z0-9._:-]{16,100}$/.test(key)) fail(400, 'INVALID_IDEMPOTENCY_KEY', 'A valid idempotency key is required.');
  const requestHash = hashToken(JSON.stringify(body));
  const previous = await pool.query('SELECT request_hash,response FROM idempotency_keys WHERE key=$1', [key]);
  if (previous.rows[0]) {
    if (previous.rows[0].request_hash !== requestHash) fail(409, 'IDEMPOTENCY_CONFLICT', 'This request key was already used for a different checkout.');
    return res.status(200).json(previous.rows[0].response);
  }
  const result = await transaction(async (client) => {
    const idempotency = await client.query('INSERT INTO idempotency_keys (key,request_hash) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING key', [key, requestHash]);
    if (!idempotency.rowCount) fail(409, 'IDEMPOTENCY_CONFLICT', 'This checkout is already being processed.');
    const userResult = req.user ? await client.query('SELECT id, m_coins FROM customers WHERE id=$1 FOR UPDATE', [req.user.id]) : { rows: [] };
    const user = userResult.rows[0] || null;
    const priced = await validateOrder(body, user, client, true);
    const orderId = crypto.randomUUID();
    const date = new Date();
    const orderNumber = `MMK-${date.toISOString().slice(0,10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const subtotal = fromCents(priced.subtotalCents);
    const discount = fromCents(priced.comboDiscountCents + priced.couponDiscountCents + priced.coinsCents);
    const shipping = fromCents(priced.shippingCents);
    const total = fromCents(priced.totalCents);
    const coinsUsed = Math.floor(priced.coinsCents / 100);
    const bulk = priced.lines.some(({ item, product }) => item.quantity >= product.min_order_qty && item.quantity > 1);
    const orderInsert = await client.query(
      `INSERT INTO orders (id,order_number,customer_id,customer_name,customer_email,customer_phone,address_line_1,address_line_2,city,state,postal_code,gstin,currency,subtotal,discount,coupon_code,m_coins_used,m_coins_discount,shipping,tax,total,payment_method,payment_status,order_status,notes,bulk_order,reservation_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'INR',$13,$14,$15,$16,$17,$18,0,$19,$20,'pending',$21,$22,$23,$24) RETURNING *`,
      [orderId, orderNumber, user?.id || null, body.customer.name, cleanEmail(body.customer.email), body.customer.phone, body.customer.address, body.customer.addressLine2 || null, body.customer.city, body.customer.state, body.customer.pincode, body.gstin || null, subtotal, discount, priced.coupon?.code || null, coinsUsed, fromCents(priced.coinsCents), shipping, total, body.paymentMethod, body.paymentMethod === 'cod' ? 'Confirmed' : 'Pending', body.notes || null, bulk, body.paymentMethod === 'razorpay' ? reservationExpiry : null],
    );
    for (const line of priced.lines) {
      const productRow = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [line.product.id]);
      const product = productRow.rows[0];
      const available = Number(product.stock_on_hand) - Number(product.stock_reserved);
      if (line.requiredStock > available) fail(409, 'INSUFFICIENT_STOCK', `There are not enough units of ${product.name} available.`);
      const updatedProduct = await client.query(
        body.paymentMethod === 'cod'
          ? 'UPDATE products SET stock_on_hand=stock_on_hand-$1,updated_at=NOW() WHERE id=$2 AND stock_on_hand-stock_reserved >= $1 RETURNING id'
          : 'UPDATE products SET stock_reserved=stock_reserved+$1,updated_at=NOW() WHERE id=$2 AND stock_on_hand-stock_reserved >= $1 RETURNING id',
        [line.requiredStock, product.id],
      );
      if (!updatedProduct.rowCount) fail(409, 'INSUFFICIENT_STOCK', `There are not enough units of ${product.name} available.`);
      const productView = productDto(product);
      await client.query(
        `INSERT INTO order_items (order_id,product_id,product_name,product_slug,sku,image,weight,pack_count,pack_label,quantity,unit_price,line_total,applied_tier_quantity,product_snapshot)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)`,
        [orderId, product.id, product.name, product.slug, product.sku, productView.image || '', productView.weight || '', line.item.selectedPack.count, line.pack.label, line.item.quantity, fromCents(line.unitPriceCents), fromCents(line.unitPriceCents * line.item.quantity), line.appliedTierQuantity, JSON.stringify(productView)],
      );
      if (body.paymentMethod === 'cod') {
        await client.query('INSERT INTO inventory_movements (product_id,quantity_delta,reason,reference_type,reference_id) VALUES ($1,$2,$3,$4,$5)', [product.id, -line.requiredStock, 'Cash on delivery order', 'order', orderId]);
      } else {
        await client.query('INSERT INTO stock_reservations (order_id,product_id,quantity,expires_at) VALUES ($1,$2,$3,$4)', [orderId, product.id, line.requiredStock, reservationExpiry]);
      }
    }
    if (coinsUsed && user) await client.query('UPDATE customers SET m_coins=m_coins-$1,updated_at=NOW() WHERE id=$2', [coinsUsed, user.id]);
    if (priced.coupon && body.paymentMethod === 'cod') await client.query('UPDATE coupons SET usage_count=usage_count+1,updated_at=NOW() WHERE code=$1', [priced.coupon.code]);
    await client.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,after_state) VALUES ($1,$2,$3,$4,$5::jsonb)', [user?.id || null, 'order.created', 'order', orderId, JSON.stringify({ orderNumber, paymentMethod: body.paymentMethod, total })]);
    if (body.paymentMethod === 'cod') await enqueueNotification(client, orderInsert.rows[0], 'order_confirmation', { amount: Number(total) });
    const order = await getOrderDto(client, orderId);
    const response = { order, reservationExpiresAt: body.paymentMethod === 'razorpay' ? reservationExpiry.toISOString() : null };
    await client.query('UPDATE idempotency_keys SET resource_id=$1,response=$2::jsonb WHERE key=$3', [orderId, JSON.stringify(response), key]);
    return response;
  });
  res.status(201).json(result);
}));


}
