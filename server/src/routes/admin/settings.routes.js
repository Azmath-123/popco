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
api.get('/admin/coupons', adminOnly, asyncRoute(async (_req, res) => {
  const rows = await pool.query('SELECT * FROM coupons ORDER BY code');
  res.json(rows.rows.map(couponDto));
}));
api.post('/admin/coupons', adminOnly, asyncRoute(async (req, res) => {
  const body = parse(z.object({ code: z.string().trim().min(3).max(64), discountType: z.enum(['percentage','fixed']), discountValue: z.number().nonnegative(), minOrder: z.number().nonnegative().default(0), maxDiscount: z.number().positive().optional(), description: z.string().trim().max(300).default(''), active: z.boolean().default(true), usageCount: z.number().int().nonnegative().default(0) }), req.body);
  const result = await pool.query('INSERT INTO coupons (code,discount_type,discount_value,min_order,max_discount,description,active,usage_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [body.code.toUpperCase(),body.discountType,body.discountValue,body.minOrder,body.maxDiscount || null,body.description,body.active,body.usageCount]);
  res.status(201).json(couponDto(result.rows[0]));
}));
api.delete('/admin/coupons/:code', adminOnly, asyncRoute(async (req, res) => {
  const result = await pool.query('DELETE FROM coupons WHERE code=$1', [req.params.code.toUpperCase()]);
  if (!result.rowCount) fail(404, 'COUPON_NOT_FOUND', 'Coupon not found.');
  res.status(204).end();
}));

api.patch('/admin/settings', adminOnly, asyncRoute(async (req, res) => {
  const body = parse(z.object({ storeName: z.string().trim().min(1).max(120).optional(), announcementText: z.string().max(500).optional(), whatsappNumber: z.string().max(30).optional(), supportEmail: z.string().email().optional(), freeShippingThreshold: z.number().nonnegative().optional(), standardShippingFee: z.number().nonnegative().optional() }).refine((value) => Object.keys(value).length > 0), req.body);
  const current = await getStoreSettings();
  const result = await pool.query("INSERT INTO store_settings (key,value) VALUES ('store',$1::jsonb) ON CONFLICT (key) DO UPDATE SET value=store_settings.value || EXCLUDED.value,updated_at=NOW() RETURNING value", [JSON.stringify({ ...current, ...body })]);
  res.json(result.rows[0].value);
}));


}
