-- server/db/migrations/001_init.sql
-- Single-transaction database schema initialization for Mukeja Makhana E-Commerce
-- Adheres strictly to SRS Revision 2.1 Section 3

BEGIN;

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 2. CUSTOM ENUMS
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'failed',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'created',
    'paid',
    'failed',
    'expired',
    'partially_refunded',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_reason AS ENUM (
    'INITIAL',
    'ADMIN_ADJUST',
    'SALE',
    'CANCEL',
    'RETURN'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. SEQUENCES
-- ============================================================================
-- Generates order numbers: ORD-100001, ORD-100002...
CREATE SEQUENCE IF NOT EXISTS order_no_seq START 100001;

-- Generates invoice numbers: INV-000001, INV-000002...
CREATE SEQUENCE IF NOT EXISTS invoice_no_seq START 1;

-- ============================================================================
-- 4. SCHEMA MIGRATION TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. CANONICAL APPLICATION TABLES (25 Tables)
-- ============================================================================

-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  is_active boolean NOT NULL DEFAULT true,
  token_version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (lower(email));

-- Table 2: password_resets
CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets (user_id);
CREATE INDEX IF NOT EXISTS password_resets_hash_idx ON password_resets (token_hash) WHERE used_at IS NULL;

-- Table 3: addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code char(6) NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS addresses_default_uq ON addresses (user_id) WHERE is_default;

-- Table 4: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

-- Table 5: collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

-- Table 6: products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  specs jsonb NOT NULL DEFAULT '{}',
  size_guide text,
  category_id uuid REFERENCES categories(id),
  is_active boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  featured_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id) WHERE is_active;

-- Table 7: product_collections
CREATE TABLE IF NOT EXISTS product_collections (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- Table 8: product_images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id, sort_order);

-- Table 9: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  size text NOT NULL,
  price_paise int NOT NULL CHECK (price_paise > 0),
  stock_qty int NOT NULL DEFAULT 0,
  reserved_qty int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  combo_eligible boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  CHECK (stock_qty >= 0),
  CHECK (reserved_qty >= 0 AND reserved_qty <= stock_qty)
);
CREATE INDEX IF NOT EXISTS variants_product_idx ON product_variants (product_id);

-- Table 10: stock_movements (inventory_logs)
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  change int NOT NULL,
  qty_after int NOT NULL,
  reason stock_reason NOT NULL,
  note text,
  order_id uuid,
  actor_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS movements_variant_idx ON stock_movements (variant_id, created_at DESC);

-- Table 11: combo_configs (combo_configurations)
CREATE TABLE IF NOT EXISTS combo_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slots int NOT NULL CHECK (slots BETWEEN 2 AND 50),
  jar_size text NOT NULL,
  combo_price_paise int NOT NULL CHECK (combo_price_paise > 0),
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS combo_one_active_uq ON combo_configs ((true)) WHERE is_active;

-- Table 12: carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  guest_token uuid UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR guest_token IS NOT NULL)
);

-- Table 13: cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity int NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, variant_id)
);

-- Table 14: cart_combos
CREATE TABLE IF NOT EXISTS cart_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  config_id uuid NOT NULL REFERENCES combo_configs(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table 15: cart_combo_items
CREATE TABLE IF NOT EXISTS cart_combo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL REFERENCES cart_combos(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity int NOT NULL CHECK (quantity > 0),
  UNIQUE (combo_id, variant_id)
);

-- Table 16: orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text NOT NULL UNIQUE,
  user_id uuid REFERENCES users(id),
  guest_name text,
  guest_phone text,
  email text,
  status order_status NOT NULL DEFAULT 'pending_payment',
  is_bulk boolean NOT NULL DEFAULT false,
  gstin text,
  subtotal_paise int NOT NULL CHECK (subtotal_paise >= 0),
  shipping_paise int NOT NULL DEFAULT 0 CHECK (shipping_paise >= 0),
  tax_paise int NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  total_paise int NOT NULL CHECK (total_paise >= 0),
  shipping_address jsonb NOT NULL,
  notes text,
  idempotency_key text NOT NULL UNIQUE,
  reserve_expires_at timestamptz,
  courier text,
  tracking_no text,
  invoice_no text UNIQUE,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR (guest_name IS NOT NULL AND guest_phone IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_reserve_expiry_idx ON orders (reserve_expires_at) WHERE status = 'pending_payment';

-- Table 17: order_combos
CREATE TABLE IF NOT EXISTS order_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  config_id uuid,
  name text NOT NULL,
  jar_size text NOT NULL,
  slots int NOT NULL,
  price_paise int NOT NULL CHECK (price_paise > 0)
);

-- Table 18: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  combo_id uuid REFERENCES order_combos(id),
  name text NOT NULL,
  sku text NOT NULL,
  size text NOT NULL,
  unit_price_paise int,
  quantity int NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

-- Table 19: payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text,
  status payment_status NOT NULL DEFAULT 'created',
  amount_paise int NOT NULL CHECK (amount_paise > 0),
  refunded_paise int NOT NULL DEFAULT 0 CHECK (refunded_paise >= 0),
  method text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table 20: webhook_events
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- Table 21: email_logs (email_queue)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  type text NOT NULL,
  to_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS email_logs_retry_idx ON email_logs (status, attempts) WHERE status IN ('pending', 'failed');

-- Table 22: banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  link text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

-- Table 23: cms_pages
CREATE TABLE IF NOT EXISTS cms_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table 24: inquiries (contact_inquiries)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table 25: audit_logs (status history & mutations)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_role text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_logs (entity_type, entity_id, created_at DESC);

-- ============================================================================
-- 6. ADDITIONAL COMPATIBILITY TABLES & VIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS combo_eligible_variants (
  combo_id uuid NOT NULL,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (combo_id, variant_id)
);

CREATE OR REPLACE VIEW inventory_logs AS SELECT * FROM stock_movements;
CREATE OR REPLACE VIEW email_queue AS SELECT * FROM email_logs;
CREATE OR REPLACE VIEW contact_inquiries AS SELECT * FROM inquiries;
CREATE OR REPLACE VIEW combo_configurations AS SELECT * FROM combo_configs;
CREATE OR REPLACE VIEW order_status_history AS 
  SELECT 
    id, 
    entity_id AS order_id, 
    action, 
    old_value->>'status' AS old_status, 
    new_value->>'status' AS new_status, 
    actor_id, 
    created_at 
  FROM audit_logs 
  WHERE entity_type = 'Order' AND action = 'UPDATE_ORDER_STATUS';

COMMIT;
