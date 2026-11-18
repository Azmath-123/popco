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
api.get('/admin/customers', adminOnly, asyncRoute(async (req, res) => {
  const search = req.query.search ? `%${String(req.query.search).slice(0,100)}%` : null;
  const rows = await pool.query('SELECT c.id,c.full_name,c.email,c.phone,c.role,c.created_at,COUNT(o.id)::int AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE ($1::text IS NULL OR c.full_name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1) GROUP BY c.id ORDER BY c.created_at DESC LIMIT 200', [search]);
  res.json(rows.rows);
}));
api.get('/admin/customers/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const customer = await pool.query('SELECT id,full_name,email,phone,role,created_at FROM customers WHERE id=$1', [req.params.id]);
  if (!customer.rows[0]) fail(404, 'CUSTOMER_NOT_FOUND', 'Customer not found.');
  const addresses = await pool.query('SELECT * FROM customer_addresses WHERE customer_id=$1 ORDER BY is_default DESC', [req.params.id]);
  const orderRows = await pool.query('SELECT id FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 100', [req.params.id]);
  res.json({ customer: userDto(customer.rows[0],addresses.rows.map(addressDto)), orders: await Promise.all(orderRows.rows.map((row) => getOrderDto(pool,row.id))) });
}));


}
