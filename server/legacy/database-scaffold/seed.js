// server/db/seed.js
// Database seed script for initial admin, CMS pages, combo config, and optional demo products

import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pool, query } from '../src/config/db.js';
import env from '../src/config/env.js';
import logger from '../src/config/logger.js';

export async function seedDatabase(options = {}) {
  const isDemo = options.demo !== undefined
    ? options.demo
    : (process.argv.includes('--demo') || process.env.SEED_DEMO === 'true');
  logger.info(`[SEED] Starting database seeding (demo: ${isDemo})...`);

  // 1. Seed Initial Admin User
  const adminEmail = (env.ADMIN_EMAIL || 'admin@mukejamakhana.com').toLowerCase().trim();
  const adminPassword = env.ADMIN_PASSWORD || 'Admin@Mukeja2026!';
  const adminName = env.ADMIN_NAME || 'Mukeja Admin';
  const adminPhone = env.ADMIN_PHONE || '+919876543210';

  const existingAdmin = await query(
    'SELECT id, email, role, token_version FROM users WHERE lower(email) = $1',
    [adminEmail]
  );

  if (existingAdmin.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await query(
      `INSERT INTO users (name, email, phone, password_hash, role, token_version, is_active)
       VALUES ($1, $2, $3, $4, 'admin', 1, true)`,
      [adminName, adminEmail, adminPhone, passwordHash]
    );
    logger.info(`[SEED] Created initial admin user: ${adminEmail}`);
  } else {
    await query(
      `UPDATE users SET role = 'admin', token_version = COALESCE(token_version, 1), is_active = true, updated_at = now()
       WHERE lower(email) = $1`,
      [adminEmail]
    );
    logger.info(`[SEED] Admin user already exists, updated role and token_version: ${adminEmail}`);
  }

  // 2. Seed Static CMS Pages
  const cmsPages = [
    {
      slug: 'about',
      title: 'About POP CO',
      body_html: `
        <h2>Our Heritage: Pure Mithilanchal Fox Nuts</h2>
        <p>POP CO Makhana originates from the nutrient-rich wetlands of Mithilanchal, Bihar — the heartland of world-class lotus seeds, packed and distributed from Meerut. Sourced directly from traditional grower cooperatives, our Makhana is GI-tagged, hand-harvested, and graded to the highest 6+ Suta standards.</p>
        <p>Zero artificial preservatives, naturally rich in protein, calcium, and antioxidants.</p>
      `.trim(),
    },
    {
      slug: 'about-us',
      title: 'About POP CO',
      body_html: `
        <h2>Our Heritage: Pure Mithilanchal Fox Nuts</h2>
        <p>POP CO Makhana originates from the nutrient-rich wetlands of Mithilanchal, Bihar — the heartland of world-class lotus seeds, packed and distributed from Meerut. Sourced directly from traditional grower cooperatives, our Makhana is GI-tagged, hand-harvested, and graded to the highest 6+ Suta standards.</p>
      `.trim(),
    },
    {
      slug: 'lookbook',
      title: 'Mukeja Makhana Lookbook',
      body_html: `
        <h2>From Bihar Ponds to Your Gourmet Table</h2>
        <p>Explore our harvest journey, traditional roasting techniques, and artisanal spice blends crafted in small batches for pristine crunch.</p>
      `.trim(),
    },
    {
      slug: 'shipping-returns',
      title: 'Shipping & Returns Policy',
      body_html: `
        <h2>Shipping & Delivery</h2>
        <p>We dispatch all orders within 24 business hours from our central Bihar facility. Standard delivery across India takes 3–5 business days.</p>
        <h2>Returns & Refunds</h2>
        <p>Due to the consumable nature of food items, returns are accepted within 48 hours only for sealed, damaged, or incorrect packages.</p>
      `.trim(),
    },
    {
      slug: 'shipping-and-returns',
      title: 'Shipping & Returns Policy',
      body_html: `
        <h2>Shipping & Delivery</h2>
        <p>Nationwide express delivery in 3–5 business days. Free shipping on all orders above ₹599.</p>
      `.trim(),
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      body_html: `
        <h2>Your Data & Security</h2>
        <p>Mukeja Makhana respects your privacy. All payment transactions are encrypted and processed securely via Razorpay PCI-DSS Level 1 compliant gateway. We never store raw credit card or UPI credentials.</p>
      `.trim(),
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      body_html: `
        <h2>Privacy & Protection</h2>
        <p>Your personal information is securely handled in compliance with applicable Indian IT rules and digital privacy standards.</p>
      `.trim(),
    },
    {
      slug: 'terms',
      title: 'Terms & Conditions',
      body_html: `
        <h2>Terms of Service</h2>
        <p>By using the Mukeja Makhana store, you agree to our terms of ordering, payment, and delivery policies governed by the laws of India.</p>
      `.trim(),
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      body_html: `
        <h2>Terms of Service</h2>
        <p>Governed by laws of India, jurisdiction of Meerut, Uttar Pradesh.</p>
      `.trim(),
    },
    {
      slug: 'contact',
      title: 'Contact & Support',
      body_html: `
        <h2>Customer Care</h2>
        <p>Email: Support@thepopcoindia.com</p>
        <p>WhatsApp / Call: 8080808447</p>
        <p>Registered Address: O-Pocket Pallavpuram Phase-2 Modipuram Meerut 250110</p>
      `.trim(),
    },
  ];

  for (const page of cmsPages) {
    await query(
      `INSERT INTO cms_pages (slug, title, body_html, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         body_html = EXCLUDED.body_html,
         updated_at = now()`,
      [page.slug, page.title, page.body_html]
    );
  }
  logger.info(`[SEED] Seeded ${cmsPages.length} CMS pages.`);

  // 3. Seed 10-Slot Combo Configuration
  let comboConfigId;
  const existingCombo = await query(
    'SELECT id FROM combo_configs WHERE is_active = true LIMIT 1'
  );

  if (existingCombo.rowCount === 0) {
    const comboRes = await query(
      `INSERT INTO combo_configs (name, slots, jar_size, combo_price_paise, is_active, updated_at)
       VALUES ($1, $2, $3, $4, true, now())
       RETURNING id`,
      ['Custom Combo', 10, '70g', 179900] // 179900 paise = ₹1,799
    );
    comboConfigId = comboRes.rows[0].id;
    logger.info(`[SEED] Created 10-slot combo configuration: ${comboConfigId}`);
  } else {
    comboConfigId = existingCombo.rows[0].id;
    await query(
      `UPDATE combo_configs
       SET name = $1, slots = $2, jar_size = $3, combo_price_paise = $4, updated_at = now()
       WHERE id = $5`,
      ['Custom Combo', 10, '70g', 179900, comboConfigId]
    );
    logger.info(`[SEED] Updated active 10-slot combo configuration: ${comboConfigId}`);
  }

  // 4. Seed Demo Bihar Makhana Catalogue if --demo flag provided
  if (isDemo) {
    logger.info('[SEED] Seeding demo catalogue with 5 Bihar Makhana products...');

    // Categories
    const categoriesData = [
      { name: 'Raw & Natural Makhana', slug: 'raw', sort_order: 1 },
      { name: 'Flavoured Roasted Makhana', slug: 'flavoured', sort_order: 2 },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const catRes = await query(
        `INSERT INTO categories (name, slug, sort_order, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.sort_order]
      );
      categoryMap[cat.slug] = catRes.rows[0].id;
    }

    // Demo Products
    const productsData = [
      {
        name: 'Classic Salted Bihar Makhana',
        slug: 'classic-salted-makhana',
        category_slug: 'raw',
        tagline: 'Gently roasted with natural rock salt from Mithilanchal',
        description: 'Premium GI-tagged hand-harvested lotus seeds gently roasted to crisp perfection with a light sprinkle of pure Himalayan rock salt. High in protein and dietary minerals.',
        specs: {
          origin: 'Mithilanchal, Bihar',
          grade: '6+ Suta Giant Pop',
          roast_type: 'Slow Hot Air Roasted (Non-Fried)',
          shelf_life: '12 Months',
        },
        images: ['/product_1.webp', '/product_back_100g.webp'],
        variants: [
          { sku: 'MMK-CLS-70G', size: '70g', price_paise: 14900, stock_qty: 150, combo_eligible: true },
          { sku: 'MMK-CLS-250G', size: '250g', price_paise: 39900, stock_qty: 100, combo_eligible: false },
        ],
      },
      {
        name: 'Roasted Pudina Bihar Makhana',
        slug: 'roasted-pudina-makhana',
        category_slug: 'flavoured',
        tagline: 'Cooling garden mint and aromatic Indian spices',
        description: 'Crisp lotus pops seasoned with fresh garden mint, tangy dry mango, and fragrant roasted cumin. A zesty, refreshing snack crafted in authentic Bihari style.',
        specs: {
          origin: 'Bihar (Packed in Meerut)',
          grade: '6+ Suta Giant Pop',
          roast_type: 'Slow Hot Air Roasted',
          shelf_life: '12 Months',
        },
        images: ['/mintypudina_front.webp', '/mintypudina_back.webp'],
        variants: [
          { sku: 'MMK-PUD-70G', size: '70g', price_paise: 16900, stock_qty: 120, combo_eligible: true },
          { sku: 'MMK-PUD-250G', size: '250g', price_paise: 42900, stock_qty: 80, combo_eligible: false },
        ],
      },
      {
        name: 'Peri Peri Roasted Makhana',
        slug: 'peri-peri-roasted-makhana',
        category_slug: 'flavoured',
        tagline: 'Fiery bird eye chillies with an African peri peri twist',
        description: 'A bold, smoky kick of fiery bird eye chili peppers blended with garlic, onion, and lime on light crunchy Bihar lotus seeds. Perfect party snack.',
        specs: {
          origin: 'Mithilanchal, Bihar',
          grade: '6+ Suta Giant Pop',
          roast_type: 'Slow Hot Air Roasted',
          shelf_life: '12 Months',
        },
        images: ['/periperi_front.webp', '/periperi_back.webp'],
        variants: [
          { sku: 'MMK-PERI-70G', size: '70g', price_paise: 16900, stock_qty: 140, combo_eligible: true },
          { sku: 'MMK-PERI-250G', size: '250g', price_paise: 42900, stock_qty: 90, combo_eligible: false },
        ],
      },
      {
        name: 'Himalayan Pink Salt Makhana',
        slug: 'himalayan-pink-salt-makhana',
        category_slug: 'raw',
        tagline: 'Clean mineral crunch with unprocessed pink salt',
        description: 'Unadulterated GI-certified lotus seeds lightly roasted in cold-pressed olive oil mist with 84 essential trace minerals from pristine pink salt crystals.',
        specs: {
          origin: 'Madhubani, Bihar',
          grade: '6+ Suta Super Jumbo',
          roast_type: 'Slow Hot Air Roasted',
          shelf_life: '12 Months',
        },
        images: ['/product_2.webp', '/product_back_200g.webp'],
        variants: [
          { sku: 'MMK-HPS-70G', size: '70g', price_paise: 15900, stock_qty: 130, combo_eligible: true },
          { sku: 'MMK-HPS-250G', size: '250g', price_paise: 39900, stock_qty: 110, combo_eligible: false },
        ],
      },
      {
        name: 'Cream & Onion Roasted Makhana',
        slug: 'cream-and-onion-roasted-makhana',
        category_slug: 'flavoured',
        tagline: 'Velvety sour cream infusion with sweet spring onions',
        description: 'Rich, savoury sour cream seasoning delicately balanced with sweet scallions and garden herbs on crunchy roasted lotus seeds. Gourmet snacking redefined.',
        specs: {
          origin: 'Bihar (Packed in Meerut)',
          grade: '6+ Suta Giant Pop',
          roast_type: 'Slow Hot Air Roasted',
          shelf_life: '12 Months',
        },
        images: ['/creamandonion_front.webp', '/creamandonion_back.webp'],
        variants: [
          { sku: 'MMK-CNO-70G', size: '70g', price_paise: 16900, stock_qty: 110, combo_eligible: true },
          { sku: 'MMK-CNO-250G', size: '250g', price_paise: 42900, stock_qty: 75, combo_eligible: false },
        ],
      },
    ];

    for (let i = 0; i < productsData.length; i++) {
      const prod = productsData[i];
      const categoryId = categoryMap[prod.category_slug];

      const prodRes = await query(
        `INSERT INTO products (name, slug, tagline, description, specs, category_id, is_active, is_featured, featured_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, true, $7, now())
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           tagline = EXCLUDED.tagline,
           description = EXCLUDED.description,
           specs = EXCLUDED.specs,
           category_id = EXCLUDED.category_id,
           is_active = true,
           is_featured = true,
           featured_order = EXCLUDED.featured_order,
           updated_at = now()
         RETURNING id`,
        [prod.name, prod.slug, prod.tagline, prod.description, JSON.stringify(prod.specs), categoryId, i + 1]
      );
      const productId = prodRes.rows[0].id;

      // Seed Product Images
      await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      for (let imgIdx = 0; imgIdx < prod.images.length; imgIdx++) {
        await query(
          `INSERT INTO product_images (product_id, url, sort_order)
           VALUES ($1, $2, $3)`,
          [productId, prod.images[imgIdx], imgIdx]
        );
      }

      // Seed Variants
      for (const v of prod.variants) {
        const variantRes = await query(
          `INSERT INTO product_variants (product_id, sku, size, price_paise, stock_qty, reserved_qty, low_stock_threshold, combo_eligible, is_active)
           VALUES ($1, $2, $3, $4, $5, 0, 5, $6, true)
           ON CONFLICT (sku) DO UPDATE SET
             price_paise = EXCLUDED.price_paise,
             stock_qty = EXCLUDED.stock_qty,
             combo_eligible = EXCLUDED.combo_eligible,
             is_active = true
           RETURNING id`,
          [productId, v.sku, v.size, v.price_paise, v.stock_qty, v.combo_eligible]
        );
        const variantId = variantRes.rows[0].id;

        // Record Initial Stock Movement
        await query(
          `INSERT INTO stock_movements (variant_id, change, qty_after, reason, note)
           VALUES ($1, $2, $2, 'INITIAL', 'Initial seed stock inventory')`,
          [variantId, v.stock_qty]
        );

        // If combo eligible, record in combo_eligible_variants
        if (v.combo_eligible && comboConfigId) {
          await query(
            `INSERT INTO combo_eligible_variants (combo_id, variant_id)
             VALUES ($1, $2)
             ON CONFLICT (combo_id, variant_id) DO NOTHING`,
            [comboConfigId, variantId]
          );
        }
      }
    }

    logger.info(`[SEED] Successfully seeded ${productsData.length} demo Bihar Makhana products with variants in integer paise.`);
  }

  logger.info('[SEED] Database seeding completed successfully.');
  return { success: true };
}

// CLI Execution Handler
const isDirectExecution = process.argv[1] &&
  (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href ||
   process.argv[1].endsWith('seed.js'));

if (isDirectExecution) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Database seed failed:', err);
      try {
        await pool.end();
      } catch {
        // ignore cleanup error
      }
      process.exit(1);
    });
}

export default seedDatabase;
