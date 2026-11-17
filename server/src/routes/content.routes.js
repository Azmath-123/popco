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
api.post('/reviews', publicFormLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ productId: z.string().uuid(), author: z.string().trim().min(2).max(100), rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).optional().default(''), comment: z.string().trim().min(5).max(2000), location: z.string().trim().max(100).optional() }), req.body);
  const result = await pool.query("INSERT INTO reviews (product_id,author,rating,title,comment,location,verified) SELECT id,$2,$3,$4,$5,$6,FALSE FROM products WHERE id=$1 AND status='active' RETURNING *", [body.productId,body.author,body.rating,body.title,body.comment,body.location || null]);
  if (!result.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  res.status(201).json({ id: result.rows[0].id, productId: result.rows[0].product_id, author: result.rows[0].author, rating: result.rows[0].rating, title: result.rows[0].title, comment: result.rows[0].comment, verified: false, location: result.rows[0].location });
}));

api.post('/contact-enquiries', publicFormLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(254), phone: z.string().trim().max(30).optional().default(''), message: z.string().trim().min(10).max(5000) }), req.body);
  const row = await pool.query('INSERT INTO contact_enquiries (name,email,phone,message) VALUES ($1,$2,$3,$4) RETURNING id,created_at', [body.name,cleanEmail(body.email),body.phone,body.message]);
  if (process.env.ADMIN_NOTIFICATION_EMAIL) {
    await pool.query('INSERT INTO notification_outbox (recipient,event_type,payload) VALUES ($1,$2,$3::jsonb)', [process.env.ADMIN_NOTIFICATION_EMAIL,'contact_enquiry',JSON.stringify({ enquiryId: row.rows[0].id, ...body })]);
  }
  res.status(201).json({ id: row.rows[0].id, status: 'received' });
}));

api.post('/bulk-quotes', publicFormLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(254), phone: z.string().trim().min(7).max(30), gstin: z.string().trim().max(20).optional(), items: z.array(z.object({ productId: z.string().uuid(), quantity: quantitySchema })).min(1).max(100), message: z.string().trim().max(2000).optional().default('') }), req.body);
  const result = await pool.query('INSERT INTO bulk_quotes (customer_id,contact_name,email,phone,gstin,requested_items,message) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7) RETURNING id,status,created_at', [req.user?.id || null,body.name,cleanEmail(body.email),body.phone,body.gstin || null,JSON.stringify(body.items),body.message]);
  res.status(201).json(result.rows[0]);
}));

api.get('/admin/quotes', adminOnly, asyncRoute(async (req, res) => {
  const status = req.query.status || null;
  const rows = await pool.query('SELECT * FROM bulk_quotes WHERE ($1::text IS NULL OR status=$1) ORDER BY created_at DESC LIMIT 200', [status]);
  res.json(rows.rows);
}));
api.patch('/admin/quotes/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ status: z.enum(['new','reviewing','quoted','accepted','rejected','converted']).optional(), admin_notes: z.string().max(3000).optional() }), req.body);
  const result = await pool.query('UPDATE bulk_quotes SET status=COALESCE($1,status),admin_notes=COALESCE($2,admin_notes),updated_at=NOW() WHERE id=$3 RETURNING *', [body.status,body.admin_notes,req.params.id]);
  if (!result.rows[0]) fail(404, 'QUOTE_NOT_FOUND', 'Quote not found.');
  res.json(result.rows[0]);
}));

api.get('/admin/reports/sales', adminOnly, asyncRoute(async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) fail(400, 'VALIDATION_ERROR', 'Date range is invalid.');
  const rows = await pool.query("SELECT DATE(created_at AT TIME ZONE 'UTC') AS date,COUNT(*)::int AS orders,COALESCE(SUM(total) FILTER (WHERE payment_status='paid'),0)::numeric(12,2) AS revenue FROM orders WHERE created_at >= $1 AND created_at < $2 + INTERVAL '1 day' GROUP BY DATE(created_at AT TIME ZONE 'UTC') ORDER BY date", [from,to]);
  res.json(rows.rows);
}));

api.get('/admin/content/pages', adminOnly, asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT * FROM content_pages ORDER BY page_key');
  res.json(result.rows);
}));
api.get('/pages/:key', asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT * FROM content_pages WHERE page_key=$1 AND is_published=TRUE', [req.params.key]);
  if (!result.rows[0]) fail(404, 'PAGE_NOT_FOUND', 'Page not found.');
  res.json(result.rows[0]);
}));
api.patch('/admin/content/pages/:key', adminOnly, asyncRoute(async (req, res) => {
  const body = parse(z.object({ title: z.string().trim().min(1).max(200), content: z.string().max(50000), is_published: z.boolean() }), req.body);
  const result = await pool.query('INSERT INTO content_pages (page_key,title,content,is_published) VALUES ($1,$2,$3,$4) ON CONFLICT (page_key) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,is_published=EXCLUDED.is_published,updated_at=NOW() RETURNING *', [req.params.key,body.title,body.content,body.is_published]);
  res.json(result.rows[0]);
}));
api.get('/admin/content/banners', adminOnly, asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT * FROM banners ORDER BY display_order,id');
  res.json(result.rows);
}));
api.post('/admin/content/banners', adminOnly, asyncRoute(async (req, res) => {
  const body = parse(z.object({ title: z.string().trim().min(1).max(160), image: z.string().trim().min(1).max(1000), link: z.string().max(1000).optional(), display_order: z.number().int().default(0), is_active: z.boolean().default(true), starts_at: z.string().datetime().optional(), ends_at: z.string().datetime().optional() }), req.body);
  const result = await pool.query('INSERT INTO banners (title,image,link,display_order,is_active,starts_at,ends_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [body.title,body.image,body.link || null,body.display_order,body.is_active,body.starts_at || null,body.ends_at || null]);
  res.status(201).json(result.rows[0]);
}));
api.patch('/admin/content/banners/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const body = parse(z.object({ title: z.string().trim().min(1).max(160).optional(), image: z.string().trim().min(1).max(1000).optional(), link: z.string().max(1000).optional(), display_order: z.number().int().optional(), is_active: z.boolean().optional() }), req.body);
  const result = await pool.query('UPDATE banners SET title=COALESCE($1,title),image=COALESCE($2,image),link=COALESCE($3,link),display_order=COALESCE($4,display_order),is_active=COALESCE($5,is_active),updated_at=NOW() WHERE id=$6 RETURNING *', [body.title,body.image,body.link,body.display_order,body.is_active,req.params.id]);
  if (!result.rows[0]) fail(404, 'BANNER_NOT_FOUND', 'Banner not found.');
  res.json(result.rows[0]);
}));
api.delete('/admin/content/banners/:id', adminOnly, asyncRoute(async (req, res) => {
  parse(idSchema, req.params.id);
  const result = await pool.query('UPDATE banners SET is_active=FALSE,updated_at=NOW() WHERE id=$1', [req.params.id]);
  if (!result.rowCount) fail(404, 'BANNER_NOT_FOUND', 'Banner not found.');
  res.status(204).end();
}));


}
