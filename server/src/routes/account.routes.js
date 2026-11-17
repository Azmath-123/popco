import { routeContext } from '../http/api-context.js';

const {
  app, api, v1, frontendIndex, adminOnly, authLimiter, publicFormLimiter, checkoutLimiter,
  HttpError, fail, asyncRoute, parse, moneyCents, fromCents, asNumber, cleanEmail,
  idSchema, quantitySchema, checkoutSchema, userDto, addressDto, availableProductPacks,
  productDto, productWithTiers, listProductDtos, couponDto, orderStatusForUi, orderDto,
  getOrderDto, getStoreSettings, getCart, getOrCreateCartId, getRazorpay, enqueueNotification,
  pool, transaction, clearSessionCookie, createAccessToken, hashPassword, hashToken,
  optionalAuth, requireAuth, safeEqual, setSessionCookie, verifyPassword,
  verifyAndCaptureOrder, INITIAL_PRODUCTS, crypto, fs, path, fileURLToPath, express,
  cors, helmet, cookieParser, rateLimit, z, Razorpay, requestRefund,
} = routeContext;

export function registerRoutes() {
api.post('/auth/register', authLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(254), phone: z.string().trim().min(7).max(30), password: z.string().min(10).max(128) }), req.body);
  const result = await pool.query(
    `INSERT INTO customers (full_name, email, phone, password_hash, m_coins) VALUES ($1, $2, $3, $4, 100)
     RETURNING id, full_name, email, phone, role, m_coins, created_at`,
    [body.name, cleanEmail(body.email), body.phone, await hashPassword(body.password)],
  ).catch((error) => {
    if (error.code === '23505') fail(409, 'ACCOUNT_EXISTS', 'An account with this email already exists.');
    throw error;
  });
  const user = userDto(result.rows[0]);
  setSessionCookie(res, createAccessToken(result.rows[0]));
  res.status(201).json(user);
}));

api.post('/auth/login', authLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) }), req.body);
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [cleanEmail(body.email)]);
  const user = result.rows[0];
  if (!user || user.status !== 'active' || !(await verifyPassword(body.password, user.password_hash))) fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  setSessionCookie(res, createAccessToken(user));
  res.json(userDto(user));
}));

api.post('/auth/logout', (_req, res) => { clearSessionCookie(res); res.status(204).end(); });
api.get('/me', requireAuth(), asyncRoute(async (req, res) => {
  const addresses = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at', [req.user.id]);
  res.json(userDto(req.user, addresses.rows.map(addressDto)));
}));
api.patch('/me', requireAuth(), asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160).optional(), phone: z.string().trim().min(7).max(30).optional() }).refine((value) => Object.keys(value).length > 0), req.body);
  const result = await pool.query('UPDATE customers SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3 RETURNING id, full_name, email, phone, role, m_coins, created_at', [body.name || null, body.phone || null, req.user.id]);
  res.json(userDto(result.rows[0]));
}));

api.get('/me/addresses', requireAuth(), asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at', [req.user.id]);
  res.json(result.rows.map(addressDto));
}));
api.post('/me/addresses', requireAuth(), asyncRoute(async (req, res) => {
  const body = parse(z.object({ label: z.string().trim().min(1).max(40).default('Home'), name: z.string().trim().min(2).max(160), phone: z.string().trim().min(7).max(30), addressLine1: z.string().trim().min(4).max(300), addressLine2: z.string().trim().max(200).optional().or(z.literal('')), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), pincode: z.string().trim().min(4).max(12), isDefault: z.boolean().optional().default(false) }), req.body);
  const row = await transaction(async (client) => {
    const count = await client.query('SELECT COUNT(*)::int AS total FROM customer_addresses WHERE customer_id = $1', [req.user.id]);
    const isDefault = body.isDefault || count.rows[0].total === 0;
    if (isDefault) await client.query('UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = $1', [req.user.id]);
    const inserted = await client.query('INSERT INTO customer_addresses (customer_id,label,name,phone,address_line_1,address_line_2,city,state,postal_code,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [req.user.id, body.label, body.name, body.phone, body.addressLine1, body.addressLine2 || null, body.city, body.state, body.pincode, isDefault]);
    return inserted.rows[0];
  });
  res.status(201).json(addressDto(row));
}));
api.patch('/me/addresses/:id', requireAuth(), asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ label: z.string().trim().min(1).max(40).optional(), name: z.string().trim().min(2).max(160).optional(), phone: z.string().trim().min(7).max(30).optional(), addressLine1: z.string().trim().min(4).max(300).optional(), addressLine2: z.string().trim().max(200).optional(), city: z.string().trim().min(2).max(100).optional(), state: z.string().trim().min(2).max(100).optional(), pincode: z.string().trim().min(4).max(12).optional(), isDefault: z.boolean().optional() }), req.body);
  const row = await transaction(async (client) => {
    if (body.isDefault) await client.query('UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = $1', [req.user.id]);
    const result = await client.query(
      `UPDATE customer_addresses SET label=COALESCE($1,label),name=COALESCE($2,name),phone=COALESCE($3,phone),address_line_1=COALESCE($4,address_line_1),address_line_2=COALESCE($5,address_line_2),city=COALESCE($6,city),state=COALESCE($7,state),postal_code=COALESCE($8,postal_code),is_default=COALESCE($9,is_default)
       WHERE id=$10 AND customer_id=$11 RETURNING *`,
      [body.label,body.name,body.phone,body.addressLine1,body.addressLine2,body.city,body.state,body.pincode,body.isDefault,req.params.id,req.user.id],
    );
    return result.rows[0];
  });
  if (!row) fail(404, 'ADDRESS_NOT_FOUND', 'Address not found.');
  res.json(addressDto(row));
}));
api.delete('/me/addresses/:id', requireAuth(), asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const result = await pool.query('DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2', [req.params.id, req.user.id]);
  if (!result.rowCount) fail(404, 'ADDRESS_NOT_FOUND', 'Address not found.');
  res.status(204).end();
}));


}
