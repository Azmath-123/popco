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
api.get('/store/bootstrap', asyncRoute(async (req, res) => {
  const [products, couponsResult, reviewsResult, settings] = await Promise.all([
    listProductDtos(),
    pool.query('SELECT * FROM coupons WHERE active = TRUE ORDER BY code'),
    pool.query('SELECT r.*, p.legacy_id FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC'),
    getStoreSettings(),
  ]);
  let user = null;
  let orders = [];
  try {
    const token = req.cookies?.[process.env.SESSION_COOKIE_NAME || 'mukeja_session'];
    if (token && process.env.JWT_SECRET) {
      const jwt = await import('jsonwebtoken');
      const payload = jwt.default.verify(token, process.env.JWT_SECRET);
      const result = await pool.query('SELECT id, full_name, email, phone, role, created_at FROM customers WHERE id = $1 AND status = $2', [payload.sub, 'active']);
      if (result.rows[0]) {
        const addressRows = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at', [payload.sub]);
        user = userDto(result.rows[0], addressRows.rows.map(addressDto));
        if (result.rows[0].role === 'admin') {
          const orderRows = await pool.query('SELECT id FROM orders ORDER BY created_at DESC LIMIT 100');
          orders = await Promise.all(orderRows.rows.map((row) => getOrderDto(pool, row.id)));
        } else {
          const orderRows = await pool.query('SELECT id FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100', [payload.sub]);
          orders = await Promise.all(orderRows.rows.map((row) => getOrderDto(pool, row.id)));
        }
      }
    }
  } catch {
    user = null;
  }
  res.json({ products, coupons: couponsResult.rows.map(couponDto), reviews: reviewsResult.rows.map((row) => ({ id: row.id, productId: row.product_id, author: row.author, rating: row.rating, title: row.title, comment: row.comment, date: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), verified: row.verified, location: row.location })), settings, user, orders });
}));

api.get('/products', asyncRoute(async (req, res) => {
  const category = req.query.category && req.query.category !== 'all' ? String(req.query.category).slice(0,80) : null;
  const minPrice = req.query.min_price == null ? null : Number(req.query.min_price);
  const maxPrice = req.query.max_price == null ? null : Number(req.query.max_price);
  if ((minPrice != null && (!Number.isFinite(minPrice) || minPrice < 0)) || (maxPrice != null && (!Number.isFinite(maxPrice) || maxPrice < 0))) fail(400, 'VALIDATION_ERROR', 'Price filters must be non-negative numbers.');
  const sort = { featured: "COALESCE((product_data->>'isFeatured')::boolean,FALSE) DESC,name ASC", price_asc: 'base_price ASC,name ASC', price_desc: 'base_price DESC,name ASC', name: 'name ASC' }[req.query.sort] || "COALESCE((product_data->>'isFeatured')::boolean,FALSE) DESC,name ASC";
  const result = await pool.query(`SELECT * FROM products WHERE status='active' AND ($1::text IS NULL OR category=$1) AND ($2::numeric IS NULL OR base_price >= $2) AND ($3::numeric IS NULL OR base_price <= $3) ORDER BY ${sort}`, [category,minPrice,maxPrice]);
  const products = await Promise.all(result.rows.map((row) => productWithTiers(pool,row)));
  const size = req.query.size ? String(req.query.size).toLowerCase() : null;
  res.json(size ? products.filter((product) => String(product.weight || '').toLowerCase().includes(size) || String(product.name || '').toLowerCase().includes(size)) : products);
}));
api.get('/products/:slug', asyncRoute(async (req, res) => {
  const result = await pool.query("SELECT * FROM products WHERE slug = $1 AND status = 'active'", [req.params.slug]);
  if (!result.rows[0]) fail(404, 'PRODUCT_NOT_FOUND', 'This product is not available.');
  res.json(await productWithTiers(pool, result.rows[0]));
}));
api.get('/categories', asyncRoute(async (_req, res) => {
  const result = await pool.query("SELECT c.id,c.slug,c.name,c.description FROM categories c WHERE c.is_active=TRUE AND EXISTS (SELECT 1 FROM products p WHERE p.category=c.slug AND p.status='active') ORDER BY c.display_order,c.name");
  res.json(result.rows);
}));
api.get('/collections', asyncRoute(async (_req, res) => {
  const result = await pool.query("SELECT c.id,c.slug,c.name,c.description,c.image FROM collections c WHERE c.is_active=TRUE ORDER BY c.display_order,c.name");
  res.json(result.rows);
}));
api.get('/collections/:slug/products', asyncRoute(async (req, res) => {
  const collection = await pool.query("SELECT id FROM collections WHERE slug=$1 AND is_active=TRUE", [req.params.slug]);
  if (!collection.rows[0]) fail(404, 'COLLECTION_NOT_FOUND', 'Collection not found.');
  const rows = await pool.query("SELECT p.* FROM products p JOIN product_collections pc ON pc.product_id=p.id WHERE pc.collection_id=$1 AND p.status='active' ORDER BY p.name", [collection.rows[0].id]);
  res.json(await Promise.all(rows.rows.map((row) => productWithTiers(pool,row))));
}));
api.get('/coupons', asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT * FROM coupons WHERE active = TRUE ORDER BY code');
  res.json(result.rows.map(couponDto));
}));
api.get('/reviews', asyncRoute(async (req, res) => {
  const result = await pool.query('SELECT r.* FROM reviews r JOIN products p ON p.id = r.product_id WHERE ($1::text IS NULL OR p.slug = $1) ORDER BY r.created_at DESC', [req.query.product || null]);
  res.json(result.rows.map((row) => ({ id: row.id, productId: row.product_id, author: row.author, rating: row.rating, title: row.title, comment: row.comment, date: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), verified: row.verified, location: row.location })));
}));


}
