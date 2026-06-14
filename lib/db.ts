import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { toSlug } from './seo';

// Use PROJECT_ROOT from server.js if available, otherwise fallback to process.cwd()
// This ensures compatibility with both local dev/build and cPanel Passenger
const rootDir = process.env.PROJECT_ROOT || process.cwd();
const DB_PATH = path.join(rootDir, 'data', 'delight.db');

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _db.pragma('busy_timeout = 5000');
    _db.pragma('synchronous = NORMAL');
    _db.pragma('cache_size = -4000');
    _db.pragma('wal_autocheckpoint = 300');
    initTables(_db);
  }
  return _db;
}

export function closeDb() {
  if (_db) {
    try {
      _db.pragma('wal_checkpoint(TRUNCATE)');
      _db.close();
    } catch {}
    _db = null;
  }
}

// Ensure clean database shutdown when Passenger or Node terminates the process
process.on('SIGTERM', closeDb);
process.on('SIGINT', closeDb);

const ALL_CONTENT = [
  // Home page
  { page: 'home', section: 'hero', content_key: 'label', content_value: 'CRAFTED BY NATURE' },
  { page: 'home', section: 'hero', content_key: 'title', content_value: 'Swiss Cole\nAir Freshener' },
  { page: 'home', section: 'hero', content_key: 'subtitle', content_value: 'The original summer maple breeze. Nurturing your space with premium quality since day one.' },
  { page: 'home', section: 'hero', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg', content_type: 'image' },
  { page: 'home', section: 'brand', content_key: 'title', content_value: 'A Legacy of Fragrance Since 1995' },
  { page: 'home', section: 'brand', content_key: 'text1', content_value: 'Delight Consumer Products Private Limited is the pioneer incense sticks and incense powder, candles and wax matches manufacturing conglomerate in Sri Lanka.' },
  { page: 'home', section: 'brand', content_key: 'text2', content_value: 'The journey started with a vision of spreading fragrance around the Globe. At present we are the leading and fastest growing company for manufacturing, exporting and distributing supreme quality aromatic products across all provinces in the Domestic and Global market.' },
  { page: 'home', section: 'brand', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779475758/delight/tbyrdxiaxhzpst3ppepk.jpg', content_type: 'image' },
  { page: 'home', section: 'categories', content_key: 'categories_label', content_value: 'EXPLORE' },
  { page: 'home', section: 'categories', content_key: 'categories_title', content_value: 'Shop by Category' },
  // About page
  { page: 'about', section: 'hero', content_key: 'title', content_value: 'About Us' },
  { page: 'about', section: 'hero', content_key: 'subtitle', content_value: 'Bringing quality and tradition into every home.' },
  { page: 'about', section: 'hero', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477144/delight_static/dlr5ldfof9zr9jyfbs3e.jpg', content_type: 'image' },
  { page: 'about', section: 'who_we_are', content_key: 'title', content_value: 'Who We Are' },
  { page: 'about', section: 'who_we_are', content_key: 'text', content_value: '**Delight Consumer Products (Pvt) Ltd** is a proudly Sri Lankan manufacturing company, established in 2025 with a vision to deliver high-quality everyday essentials to modern households.\n\nOperating under the brand **“Delight,”** we specialize in producing a carefully selected range of products including incense sticks, traditional ghee oil lamps, candles, teas, and spices. Our products are inspired by Sri Lanka’s rich cultural heritage while maintaining modern standards of quality, consistency, and reliability.\n\nAs a growing company, we are focused on building a strong presence in the local market by developing trusted relationships with customers, retailers, and distributors.' },
  { page: 'about', section: 'what_we_do', content_key: 'title', content_value: 'What We Do' },
  { page: 'about', section: 'what_we_do', content_key: 'text', content_value: 'At Delight Consumer Products, we focus on manufacturing products that bring comfort, fragrance, flavor, and tradition into everyday life. Each product is developed with attention to quality, sourcing, and customer satisfaction.\n\nOur goal is to ensure that every household can enjoy products that are both authentic and dependable.' },
  { page: 'about', section: 'what_we_do', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477147/delight_static/hh4rlbmhmxr7dpgbnkqz.jpg', content_type: 'image' },
  { page: 'about', section: 'mission', content_key: 'title', content_value: 'Our Mission' },
  { page: 'about', section: 'mission', content_key: 'text', content_value: '**To deliver quality, value, and authenticity through every product we create.**\n\nWe aim to continuously improve our manufacturing processes, expand our product range, and strengthen our distribution network across Sri Lanka. At the same time, we are working towards entering international markets and sharing the essence of Sri Lankan products with a global audience.' },
  { page: 'about', section: 'vision', content_key: 'title', content_value: 'Our Vision' },
  { page: 'about', section: 'vision', content_key: 'text', content_value: '**To become a trusted Sri Lankan brand recognized for quality consumer products both locally and internationally.**' },
  { page: 'about', section: 'commitment', content_key: 'title', content_value: 'Our Commitment' },
  { page: 'about', section: 'commitment', content_key: 'item1', content_value: 'Maintaining consistent product quality' },
  { page: 'about', section: 'commitment', content_key: 'item2', content_value: 'Building long-term customer trust' },
  { page: 'about', section: 'commitment', content_key: 'item3', content_value: 'Supporting local production and sourcing' },
  { page: 'about', section: 'commitment', content_key: 'item4', content_value: 'Continuously improving and innovating' },
  { page: 'about', section: 'journey', content_key: 'title', content_value: 'Our Journey' },
  { page: 'about', section: 'journey', content_key: 'text', content_value: 'As a newly established company, our journey has just begun. With dedication, passion, and a clear vision, we are steadily growing and working towards becoming a reliable name in the consumer products industry.\n\n**Delight Consumer Products — Bringing quality and tradition into every home.**' },
  // Contact page
  { page: 'contact', section: 'hero', content_key: 'title', content_value: 'Contact Us' },
  { page: 'contact', section: 'info', content_key: 'address', content_value: "No 99/A 'Rohana' Heenatiya Balapitiya" },
  { page: 'contact', section: 'info', content_key: 'email', content_value: 'info@delight.lk, sales@delight.lk' },
  { page: 'contact', section: 'info', content_key: 'phone', content_value: '+94 11 234 5678 / +94 77 123 4567' },

  // Terms of Service
  { page: 'terms', section: 'introduction', content_key: 'text', content_value: 'Welcome to Delight Consumer Products. Established in 2025, we are dedicated to providing premium aromatic and consumer goods. By accessing our website, you agree to comply with and be bound by the following terms and conditions of use.' },
  { page: 'terms', section: 'eligibility', content_key: 'text', content_value: 'To use our services, you must be at least 18 years of age or the age of majority in your jurisdiction. By using our site, you represent and warrant that you fulfill this requirement.' },
  { page: 'terms', section: 'accounts', content_key: 'text', content_value: 'When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.' },
  { page: 'terms', section: 'purchases', content_key: 'text', content_value: 'All prices listed on the website are in Sri Lankan Rupees (Rs.) unless stated otherwise. We reserve the right to change our prices at any time without prior notice. Payments are processed securely through our authorized payment gateways.' },
  { page: 'terms', section: 'intellectual-property', content_key: 'text', content_value: 'The Service and its original content, features, and functionality are and will remain the exclusive property of Delight Consumer Products and its licensors.' },
  
  // Privacy Policy
  { page: 'privacy', section: 'collection', content_key: 'text', content_value: 'Establishing trust since 2025, Delight Consumer Products is committed to protecting your privacy. We collect personal information that you voluntarily provide to us when you register on the website, place an order, or contact us.' },
  { page: 'privacy', section: 'usage', content_key: 'text', content_value: 'We use the information we collect to process and fulfill your orders, improve our website, and send periodic updates (if opted-in).' },
  { page: 'privacy', section: 'sharing', content_key: 'text', content_value: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except for trusted third parties who assist us in operating our website.' },
  
  // Legal Notice
  { page: 'legal', section: 'company', content_key: 'details', content_value: 'Delight Consumer Products Private Limited. Established: 2025. Registered Office: [COMPANY_OFFICE_ADDRESS]. Registration Number: [COMPANY_REG_NO].' },
  { page: 'legal', section: 'representatives', content_key: 'text', content_value: 'Delight Consumer Products is legally represented by its Board of Directors. Managing Director: [DIRECTOR_NAME]. Email: legal@delight.lk' },
  { page: 'legal', section: 'disclaimer', content_key: 'text', content_value: 'Despite careful content control, we assume no liability for the content of external links. Information on this website is provided as is without warranties of any kind.' },

  // Careers page
  { page: 'careers', section: 'hero', content_key: 'label', content_value: 'Join Our Legacy' },
  { page: 'careers', section: 'hero', content_key: 'title', content_value: 'Build the Future of Aromatic Wellness' },
  { page: 'careers', section: 'hero', content_key: 'subtitle', content_value: 'At Delight, we don\'t just make products; we create experiences. Join a team dedicated to Sri Lankan craftsmanship and global excellence.' },
  { page: 'careers', section: 'hero', content_key: 'image', content_value: '', content_type: 'image' },
  { page: 'careers', section: 'heritage', content_key: 'stat1_val', content_value: '30+' },
  { page: 'careers', section: 'heritage', content_key: 'stat1_label', content_value: 'Years Heritage' },
  { page: 'careers', section: 'heritage', content_key: 'stat2_val', content_value: '250+' },
  { page: 'careers', section: 'heritage', content_key: 'stat2_label', content_value: 'Team Members' },
  { page: 'careers', section: 'heritage', content_key: 'stat3_val', content_value: '12' },
  { page: 'careers', section: 'heritage', content_key: 'stat3_label', content_value: 'Product Lines' },
  { page: 'careers', section: 'values', content_key: 'title', content_value: 'Why Work With Us?' },
  { page: 'careers', section: 'values', content_key: 'subtitle', content_value: 'We provide a collaborative environment where tradition meets innovation.' },
  { page: 'careers', section: 'perks', content_key: 'title', content_value: 'Perks & Benefits' },
  { page: 'careers', section: 'perks', content_key: 'subtitle', content_value: 'We take care of our people so they can take care of our customers.' },
  { page: 'careers', section: 'perks', content_key: 'item1_title', content_value: 'Health & Wellness' },
  { page: 'careers', section: 'perks', content_key: 'item1_text', content_value: 'Comprehensive medical coverage and wellness programs for you and your family.' },
  { page: 'careers', section: 'perks', content_key: 'item2_title', content_value: 'Continuous Learning' },
  { page: 'careers', section: 'perks', content_key: 'item2_text', content_value: 'We sponsor your growth with training programs and educational allowances.' },
  { page: 'careers', section: 'perks', content_key: 'item3_title', content_value: 'Work-Life Harmony' },
  { page: 'careers', section: 'perks', content_key: 'item3_text', content_value: 'Flexible working hours and generous paid time off policies.' },
  { page: 'careers', section: 'perks', content_key: 'item4_title', content_value: 'Employee Discounts' },
  { page: 'careers', section: 'perks', content_key: 'item4_text', content_value: 'Exclusive rates on our entire range of aromatic and lifestyle products.' },
  { page: 'careers', section: 'quote', content_key: 'text', content_value: 'Working at Delight is more than a job. It\'s a family that nurtures your ambition and rewards your dedication to craftsmanship.' },
  { page: 'careers', section: 'quote', content_key: 'author', content_value: 'Sarah Fernando, Lead Product Developer' },
  { page: 'careers', section: 'spontaneous', content_key: 'title', content_value: 'Don\'t see the right fit?' },
  { page: 'careers', section: 'spontaneous', content_key: 'text', content_value: 'We are always looking for passionate people to join our legacy. Send us your CV for future consideration.' },
] as { page: string; section: string; content_key: string; content_value: string; content_type?: string }[];


function seedAllContent(database: Database.Database) {
  const stmt = database.prepare('INSERT OR IGNORE INTO site_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?)');
  for (const c of ALL_CONTENT) {
    stmt.run(c.page, c.section, c.content_key, c.content_value, c.content_type || 'text');
  }
}

function ensureContent(database: Database.Database) {
  // Insert any missing content entries (won't overwrite existing ones)
  const stmt = database.prepare('INSERT OR IGNORE INTO site_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?)');
  for (const c of ALL_CONTENT) {
    stmt.run(c.page, c.section, c.content_key, c.content_value, c.content_type || 'text');
  }
}

function backfillProductSlugs(db: Database.Database) {
  // Generate slug from name for products that don't have one yet
  const products = db.prepare('SELECT id, name FROM products WHERE slug IS NULL OR slug = \'\'').all() as { id: number; name: string }[];
  if (products.length === 0) return;

  const updateStmt = db.prepare('UPDATE products SET slug = ? WHERE id = ?');
  for (const product of products) {
    let baseSlug = toSlug(product.name);
    if (!baseSlug) baseSlug = `product-${product.id}`;

    // Ensure uniqueness — if slug already taken, append the ID
    const existing = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(baseSlug, product.id);
    const finalSlug = existing ? `${baseSlug}-${product.id}` : baseSlug;
    updateStmt.run(finalSlug, product.id);
  }
}

function initTables(db: Database.Database) {

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      admin_role TEXT DEFAULT 'admin',
      permissions TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      original_price REAL DEFAULT NULL,
      image TEXT DEFAULT 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg',
      category TEXT DEFAULT 'Uncategorized',
      stock INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_sale INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      content_key TEXT NOT NULL,
      content_value TEXT DEFAULT '',
      content_type TEXT DEFAULT 'text',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(page, section, content_key)
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      mime_type TEXT DEFAULT '',
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      items_json TEXT DEFAULT '[]',
      subtotal REAL DEFAULT 0,
      shipping REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT DEFAULT '',
      answered_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      image_url TEXT DEFAULT 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg',
      status TEXT DEFAULT 'active',
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      location TEXT DEFAULT 'Balapitiya',
      type TEXT DEFAULT 'Full-time',
      description TEXT NOT NULL,
      requirements TEXT,
      benefits TEXT,
      form_config_json TEXT, -- JSON configuration for the application form
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      candidate_phone TEXT,
      cv_url TEXT,
      message TEXT,
      custom_answers_json TEXT, -- Store answers to custom questions
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT '',
      subtitle TEXT DEFAULT '',
      label TEXT DEFAULT '',
      image TEXT NOT NULL,
      image_mobile TEXT DEFAULT NULL,
      link_url TEXT DEFAULT '/shop',
      link_text TEXT DEFAULT 'SHOP NOW',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_info_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      detail_content TEXT DEFAULT '',
      detail_image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'percent', 'fixed', 'free_shipping'
      discount_value REAL NOT NULL DEFAULT 0,
      min_spend REAL DEFAULT 0,
      expiry_date DATETIME,
      usage_count INTEGER DEFAULT 0,
      usage_limit INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS return_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      user_id INTEGER,
      order_number TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      duration INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 1,
      device_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: add columns to orders if missing
  try { db.exec('ALTER TABLE orders ADD COLUMN user_id INTEGER DEFAULT NULL'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN shipping_address TEXT DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN shipping_city TEXT DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT "cod"'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN coupon_code TEXT DEFAULT NULL'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN payment_slip TEXT DEFAULT NULL'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN delivered_at DATETIME DEFAULT NULL'); } catch {}
  // Migration: add new product fields
  try { db.exec('ALTER TABLE products ADD COLUMN short_description TEXT DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN long_description TEXT DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN key_features TEXT DEFAULT ""'); } catch {}
  // Migration: add weight fields
  try { db.exec('ALTER TABLE products ADD COLUMN weight REAL DEFAULT 1'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN weight_unit TEXT DEFAULT "kg"'); } catch {}
  // Migration: add min_order_quantity
  try { db.exec('ALTER TABLE products ADD COLUMN min_order_quantity INTEGER DEFAULT 1'); } catch {}
  // Migration: add SEO slug column
  try { db.exec('ALTER TABLE products ADD COLUMN slug TEXT DEFAULT NULL'); } catch {}
  try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL'); } catch {}
  // Backfill slugs for any existing products that don't have one
  backfillProductSlugs(db);

  // Migration: add mobile image to hero slides
  try { db.exec('ALTER TABLE hero_slides ADD COLUMN image_mobile TEXT DEFAULT NULL'); } catch {}

  // Migration: add role and permissions to admins
  try { db.exec("ALTER TABLE admins ADD COLUMN admin_role TEXT DEFAULT 'admin'"); } catch {}
  try { db.exec("ALTER TABLE admins ADD COLUMN permissions TEXT DEFAULT '[]'"); } catch {}
  try { db.exec("ALTER TABLE admins ADD COLUMN is_active INTEGER DEFAULT 1"); } catch {}
  // Update existing default admin to super_admin
  try { db.exec("UPDATE admins SET admin_role = 'super_admin' WHERE username = 'admin' OR id = 1"); } catch {}

  // Migration: add google_id to users
  try { db.exec("ALTER TABLE users ADD COLUMN google_id TEXT DEFAULT NULL"); } catch {}

  // Seed default admin if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync('delight2026', 10);
    db.prepare('INSERT INTO admins (username, email, password_hash, admin_role, permissions) VALUES (?, ?, ?, ?, ?)').run('admin', 'admin@delight.lk', hash, 'super_admin', '[]');
  }

  // Seed default products if none exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const products = [
      { name: 'Delight Oud Ires Perfume 30ml', price: 2250, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477019/delight_products/mihfvg9i4bohcajarnf0.jpg', category: 'Perfume', stock: 50, is_featured: 1 },
      { name: 'Delight Dame Lady Perfume 30ml', price: 2250, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477019/delight_products/mihfvg9i4bohcajarnf0.jpg', category: 'Perfume', stock: 35, is_featured: 1 },
      { name: 'Lavender Incense Sticks Dozen Pack', price: 1620, original_price: 1800, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', category: 'Incense', stock: 100, is_sale: 1, is_featured: 1 },
      { name: 'Rose Incense Sticks Dozen Pack', price: 1620, original_price: 1800, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', category: 'Incense', stock: 80, is_sale: 1, is_featured: 1 },
      { name: 'Delight Morning Jasmine Incense', price: 450, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', category: 'Incense', stock: 200 },
      { name: 'Sandalwood Sacred Sticks', price: 600, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', category: 'Incense', stock: 150 },
      { name: 'Citrus Burst Car Freshener', price: 1200, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477019/delight_products/mihfvg9i4bohcajarnf0.jpg', category: 'Air Care', stock: 75 },
      { name: 'Midnight Oud Perfumed Oil', price: 2500, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477019/delight_products/mihfvg9i4bohcajarnf0.jpg', category: 'Perfume', stock: 40 },
      { name: 'Lavender Calm Room Spray', price: 850, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477025/delight_hero/wx7mq9ck0mcwo8frdznh.jpg', category: 'Air Care', stock: 60 },
      { name: 'Forest Breeze Incense', price: 450, image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', category: 'Incense', stock: 180 },
    ];
    const stmt = db.prepare('INSERT INTO products (name, price, original_price, image, category, stock, is_featured, is_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of products) {
      stmt.run(p.name, p.price, p.original_price || null, p.image, p.category, p.stock, p.is_featured || 0, p.is_sale || 0);
    }
  }

  // Seed default site content
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM site_content').get() as { count: number };
  if (contentCount.count === 0) {
    seedAllContent(db);
  } else {
    // Ensure new content entries exist even on existing DBs
    ensureContent(db);
  }


  // Seed sample orders
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  if (orderCount.count === 0) {
    const orders = [
      { order_number: 'DLT-001', customer_name: 'Kasun Perera', customer_email: 'kasun@gmail.com', customer_phone: '+94 77 123 4567', items_json: JSON.stringify([{ name: 'Lavender Incense', qty: 2, price: 1620 }]), subtotal: 3240, shipping: 250, total: 3490, status: 'delivered' },
      { order_number: 'DLT-002', customer_name: 'Nimali Silva', customer_email: 'nimali@gmail.com', customer_phone: '+94 71 234 5678', items_json: JSON.stringify([{ name: 'Oud Ires Perfume', qty: 1, price: 2250 }]), subtotal: 2250, shipping: 250, total: 2500, status: 'shipped' },
      { order_number: 'DLT-003', customer_name: 'Amal Fernando', customer_email: 'amal@gmail.com', customer_phone: '+94 76 345 6789', items_json: JSON.stringify([{ name: 'Car Freshener', qty: 3, price: 1200 }]), subtotal: 3600, shipping: 0, total: 3600, status: 'processing' },
      { order_number: 'DLT-004', customer_name: 'Dilshan Rajapaksa', customer_email: 'dilshan@gmail.com', customer_phone: '+94 72 456 7890', items_json: JSON.stringify([{ name: 'Rose Incense', qty: 1, price: 1620 }, { name: 'Room Spray', qty: 2, price: 850 }]), subtotal: 3320, shipping: 250, total: 3570, status: 'pending' },
    ];
    const stmt = db.prepare('INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, items_json, subtotal, shipping, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const o of orders) {
      stmt.run(o.order_number, o.customer_name, o.customer_email, o.customer_phone, o.items_json, o.subtotal, o.shipping, o.total, o.status);
    }
  }

  // Seed default coupons
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number };
  if (couponCount.count === 0) {
    const coupons = [
      { code: 'WELCOME10', type: 'percent', value: 10, min_spend: 1000 },
      { code: 'MINUS500', type: 'fixed', value: 500, min_spend: 2500 },
      { code: 'FREESHIP', type: 'free_shipping', value: 0, min_spend: 3000 }
    ];
    const stmt = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, min_spend) VALUES (?, ?, ?, ?)');
    for (const c of coupons) {
      stmt.run(c.code, c.type, c.value, c.min_spend);
    }
  }

  // Seed default news if none exists
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news_articles').get() as { count: number };
  if (newsCount.count === 0) {
    const articles = [
      { 
        title: 'Delight Consumer Products: Re-Established in 2025', 
        slug: 'established-2025', 
        excerpt: 'Celebrating our new chapter in 2025 with a renewed commitment to premium aromatic excellence.',
        content: 'Delight Consumer Products has officially entered a new era. Since our re-establishment in 2025, we have focused on blending traditional Sri Lankan craftsmanship with modern aromatic science. Our new facility in Balapitiya is now fully operational, producing the highest quality incense and air care products in the region.',
        image_url: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779475758/delight/tbyrdxiaxhzpst3ppepk.jpg'
      },
      { 
        title: 'Expanding into Food & Beverages', 
        slug: 'food-and-beverages-expansion', 
        excerpt: 'We are excited to announce our upcoming range of premium food and beverage products.',
        content: 'Building on our legacy of quality, Delight is expanding its horizons. Soon, you will be able to enjoy a selection of premium food and beverage products crafted with the same attention to detail and natural ingredients you love in our aromatic range. Stay tuned for our launch early next year!',
        image_url: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg'
      },
      { 
        title: 'The Art of Pure Incense', 
        slug: 'art-of-pure-incense', 
        excerpt: 'Discover the secrets behind our world-class incense sticks and powder.',
        content: 'Every stick of Delight incense is a masterpiece. We sourced the finest natural resins and essential oils from across the globe to ensure a clean, long-lasting fragrance. Our traditional Sambrani powder remains a favorite for purification and meditation, crafted using a recipe perfected over decades.',
        image_url: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg'
      }
    ];
    const stmt = db.prepare('INSERT INTO news_articles (title, slug, excerpt, content, image_url) VALUES (?, ?, ?, ?, ?)');
    for (const a of articles) {
      stmt.run(a.title, a.slug, a.excerpt, a.content, a.image_url);
    }
  }

  // Seed default FAQs if none exist
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as { count: number };
  if (faqCount.count === 0) {
    const faqs = [
      { category: 'General', question: 'What makes Delight products unique?', answer: 'Delight Consumer Products combines traditional Sri Lankan craftsmanship with premium raw materials for a lasting aromatic experience.' },
      { category: 'General', question: 'Where are you located?', answer: 'Our main manufacturing and administrative office is at No 99/A Rohana, Heenatiya, Balapitiya, Sri Lanka.' },
      { category: 'Orders', question: 'How long does shipping take?', answer: 'Domestic orders usually arrive in 2-4 business days. International orders take 7-14 days.' },
      { category: 'Returns', question: 'What is your return policy?', answer: 'We offer a 7-day return policy for unopened items in their original packaging.' }
    ];
    const stmt = db.prepare('INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)');
    for (const f of faqs) {
        stmt.run(f.category, f.question, f.answer);
    }
  }

  // Seed default jobs if none exist
  const jobCount = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as { count: number };
  if (jobCount.count === 0) {
    const jobs = [
      { 
        title: 'Sales Executive', 
        department: 'Sales', 
        description: 'Driving sales growth for our premium aromatic products.',
        requirements: 'Experience in FMCG sales, Excellent communication skills.',
        form_config_json: JSON.stringify({
          requirePhone: true,
          requireCV: true,
          requireCoverLetter: false,
          customQuestions: [{ label: 'Years of Experience in FMCG', type: 'number' }]
        })
      },
      { 
        title: 'Production Supervisor', 
        department: 'Production', 
        description: 'Overseeing the daily production operations of our incense sticks facility.',
        requirements: 'Background in manufacturing management, Attention to detail.',
        form_config_json: JSON.stringify({
          requirePhone: true,
          requireCV: true,
          requireCoverLetter: true,
          customQuestions: []
        })
      }
    ];
    const stmt = db.prepare('INSERT INTO jobs (title, department, description, requirements, form_config_json) VALUES (?, ?, ?, ?, ?)');
    for (const j of jobs) {
      stmt.run(j.title, j.department, j.description, j.requirements, j.form_config_json);
    }
  }

  // Seed default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const settings = [
      { key: 'site_name', value: 'Delight Consumer Products' },
      { key: 'site_tagline', value: 'Nurtured by Nature' },
      { key: 'contact_phone', value: '+94 11 234 5678' },
      { key: 'contact_email', value: 'info@delight.lk' },
      { key: 'contact_address', value: "No 99/A 'Rohana' Heenatiya Balapitiya" },
      { key: 'bank_name', value: 'Bank of Ceylon' },
      { key: 'bank_account_name', value: 'Delight Consumer Products PVT LTD' },
      { key: 'bank_account_number', value: '1234567890' },
      { key: 'bank_branch', value: 'Colombo Fort' },
      { key: 'whatsapp', value: '+94 11 234 5678' },
      { key: 'footer_manifesto', value: "Pioneering Sri Lanka's finest aromatic experiences since 1995. Crafted by nature, designed for your ultimate relaxation and peace." },
      { key: 'facebook', value: '' },
      { key: 'tiktok', value: '' },
      { key: 'youtube', value: '' },
      { key: 'popup_enabled', value: '1' },
      { key: 'popup_title', value: 'Welcome to Delight!' },
      { key: 'popup_description', value: 'Enjoy 15% off your first order. Use code DELIGHT15 at checkout.' },
      { key: 'popup_image', value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg' },
      { key: 'popup_link', value: '/shop' },
      { key: 'popup_link_text', value: 'Shop Now' },
      { key: 'popup_delay_seconds', value: '5' },
      { key: 'site_status', value: 'live' },
    ];
    const stmt = db.prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)');
    for (const s of settings) {
      stmt.run(s.key, s.value);
    }
  }
  // Ensure popup settings & site_status exist on existing DBs
  const popupKeys = ['popup_enabled','popup_title','popup_description','popup_image','popup_link','popup_link_text','popup_delay_seconds','site_status'];
  const popupDefaults: Record<string,string> = { popup_enabled:'1', popup_title:'Welcome to Delight!', popup_description:'Enjoy 15% off your first order. Use code DELIGHT15 at checkout.', popup_image:'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg', popup_link:'/shop', popup_link_text:'Shop Now', popup_delay_seconds:'5', site_status:'live' };
  for (const pk of popupKeys) {
    const exists = db.prepare('SELECT id FROM settings WHERE setting_key = ?').get(pk);
    if (!exists) db.prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)').run(pk, popupDefaults[pk]);
  }

  // Seed default hero slides if none exist
  const heroCount = db.prepare('SELECT COUNT(*) as count FROM hero_slides').get() as { count: number };
  if (heroCount.count === 0) {
    const slides = [
      { title: 'Swiss Cole\nAir Freshener', subtitle: 'The original summer maple breeze. Nurturing your space with premium quality since day one.', label: 'CRAFTED BY NATURE', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg', link_url: '/shop', link_text: 'SHOP NOW' },
      { title: 'Premium\nIncense Sticks', subtitle: 'Handcrafted with natural ingredients for a pure, lasting fragrance experience.', label: 'TRADITIONAL QUALITY', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476104/delight_hero/qcxhzp9mejgxgzo5du11.jpg', link_url: '/shop?category=Incense', link_text: 'EXPLORE' },
      { title: 'Delight\nCandles Collection', subtitle: 'Illuminate your moments with our premium candle range. Made with the finest wax.', label: 'NEW COLLECTION', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477025/delight_hero/wx7mq9ck0mcwo8frdznh.jpg', link_url: '/shop?category=Candles', link_text: 'DISCOVER' },
    ];
    const stmt = db.prepare('INSERT INTO hero_slides (title, subtitle, label, image, image_mobile, link_url, link_text, sort_order) VALUES (?,?,?,?,?,?,?,?)');
    slides.forEach((s, i) => stmt.run(s.title, s.subtitle, s.label, s.image, null, s.link_url, s.link_text, i));
  }

  // Seed default product info cards if none exist
  const infoCount = db.prepare('SELECT COUNT(*) as count FROM product_info_cards').get() as { count: number };
  if (infoCount.count === 0) {
    const cards = [
      { title: 'Incense Sticks', subtitle: 'Handcrafted Traditions', description: 'Discover the art of traditional incense making with premium natural ingredients.', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', slug: 'incense-sticks', detail_content: '## The Art of Incense Making\n\nOur incense sticks are handcrafted using a blend of natural resins, essential oils, and aromatic herbs. Each stick is carefully rolled by skilled artisans following traditional methods passed down through generations.\n\n## What We Use\n\nWe source only the finest sandalwood powder, natural bamboo sticks, essential oils, and plant-based binding agents. No synthetic fragrances or chemicals are ever used.\n\n## How We Make Them\n\nThe process begins with selecting premium raw materials, followed by hand-blending the aromatic paste, rolling each stick individually, and slow-drying in natural air for optimal fragrance retention.' },
      { title: 'Air Fresheners', subtitle: 'Breathe Pure Luxury', description: 'Premium air care solutions that transform your space with lasting freshness.', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477019/delight_products/mihfvg9i4bohcajarnf0.jpg', slug: 'air-fresheners', detail_content: '## Science Meets Nature\n\nOur air fresheners combine cutting-edge fragrance technology with natural essential oils to create long-lasting, room-filling scents that truly transform your space.\n\n## Premium Ingredients\n\nEach product features a proprietary blend of essential oils, naturally-derived fragrance compounds, and eco-friendly propellants designed for maximum freshness with minimal environmental impact.' },
      { title: 'Safety Wax Matches', subtitle: 'Strike with Confidence', description: 'Premium safety matches crafted for reliable performance and superior quality.', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476158/delight_products/vhimexta6wepflrccbct.jpg', slug: 'safety-wax-matches', detail_content: '## Superior Match Quality\n\nOur safety wax matches are manufactured using the highest quality materials. Each match head is formulated for reliable ignition and a steady, clean flame.\n\n## Safety First\n\nDesigned with a special safety coating that prevents accidental ignition, our matches meet international safety standards while delivering reliable performance every time.' },
      { title: 'Candles', subtitle: 'Illuminate Your Moments', description: 'Hand-poured candles made with premium wax for a clean, even burn.', image: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476169/delight_products/dbj06zeb71pumlowtwbs.jpg', slug: 'candles', detail_content: '## The Perfect Glow\n\nOur candles are hand-poured using premium grade wax that burns cleanly and evenly. Each candle is crafted to provide hours of warm, ambient light.\n\n## Quality Wax\n\nWe use a specially formulated wax blend that produces minimal soot and provides a consistent, beautiful flame throughout the life of the candle.' },
    ];
    const stmt = db.prepare('INSERT INTO product_info_cards (title, subtitle, description, image, slug, detail_content, sort_order) VALUES (?,?,?,?,?,?,?)');
    cards.forEach((c, i) => stmt.run(c.title, c.subtitle, c.description, c.image, c.slug, c.detail_content, i));
  }
}

// ─── Query Helpers ───
export const db = {
  get instance() { return getDb(); },

  // Products
  getProducts(opts?: { search?: string; category?: string; limit?: number; offset?: number }) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: unknown[] = [];
    if (opts?.search) { query += ' AND name LIKE ?'; params.push(`%${opts.search}%`); }
    if (opts?.category && opts.category !== 'all') { query += ' AND category = ?'; params.push(opts.category); }
    query += ' ORDER BY created_at DESC';
    if (opts?.limit) { query += ' LIMIT ?'; params.push(opts.limit); }
    if (opts?.offset) { query += ' OFFSET ?'; params.push(opts.offset); }
    return getDb().prepare(query).all(...params);
  },

  getProduct(id: number) {
    return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  getProductBySlug(slug: string) {
    return getDb().prepare('SELECT * FROM products WHERE slug = ?').get(slug);
  },

  getProductByIdOrSlug(idOrSlug: string) {
    // Try numeric ID first, then slug
    const numId = parseInt(idOrSlug);
    if (!isNaN(numId)) {
      return getDb().prepare('SELECT * FROM products WHERE id = ?').get(numId);
    }
    return getDb().prepare('SELECT * FROM products WHERE slug = ?').get(idOrSlug);
  },

  createProduct(data: Record<string, unknown>) {
    // Auto-generate slug from name if not provided
    const nameStr = String(data.name || '');
    let slug = data.slug ? String(data.slug) : toSlug(nameStr);
    if (!slug) slug = `product-${Date.now()}`;
    // Ensure uniqueness
    const existing = getDb().prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (existing) slug = `${slug}-${Date.now()}`;
    const stmt = getDb().prepare(`INSERT INTO products (name, description, short_description, long_description, key_features, price, original_price, image, category, stock, is_featured, is_sale, status, slug, weight, weight_unit, min_order_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(nameStr, data.description || '', data.short_description || '', data.long_description || '', data.key_features || '', data.price, data.original_price || null, data.image || 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg', data.category || 'Uncategorized', data.stock || 0, data.is_featured ? 1 : 0, data.is_sale ? 1 : 0, data.status || 'active', slug, data.weight || 1, data.weight_unit || 'kg', data.min_order_quantity !== undefined ? data.min_order_quantity : 1);
  },

  updateProduct(id: number, data: Record<string, unknown>) {
    const nameStr = String(data.name || '');
    // Keep existing slug unless name changed and no slug provided
    let slug = data.slug ? String(data.slug) : undefined;
    if (!slug) {
      const cur = getDb().prepare('SELECT slug FROM products WHERE id = ?').get(id) as { slug: string | null } | undefined;
      slug = cur?.slug || toSlug(nameStr) || `product-${id}`;
    }
    const stmt = getDb().prepare(`UPDATE products SET name=?, description=?, short_description=?, long_description=?, key_features=?, price=?, original_price=?, image=?, category=?, stock=?, is_featured=?, is_sale=?, status=?, slug=?, weight=?, weight_unit=?, min_order_quantity=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    return stmt.run(nameStr, data.description || '', data.short_description || '', data.long_description || '', data.key_features || '', data.price, data.original_price || null, data.image, data.category, data.stock, data.is_featured ? 1 : 0, data.is_sale ? 1 : 0, data.status, slug, data.weight !== undefined ? data.weight : 1, data.weight_unit || 'kg', data.min_order_quantity !== undefined ? data.min_order_quantity : 1, id);
  },

  deleteProduct(id: number) {
    return getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
  },

  getProductCount() {
    return (getDb().prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
  },

  getCategories() {
    const fallback = ['Incense', 'Perfume', 'Air Care', 'Candles', 'Matches', 'Gift Pack'];
    const row = getDb().prepare("SELECT setting_value FROM settings WHERE setting_key = 'product_categories'").get() as { setting_value: string } | undefined;
    if (row && row.setting_value) {
      try {
        const parsed = JSON.parse(row.setting_value) as string[];
        return parsed.map(category => ({ category }));
      } catch {
        return fallback.map(category => ({ category }));
      }
    }
    return fallback.map(category => ({ category }));
  },

  isCategoryInUse(category: string) {
    const row = getDb().prepare('SELECT COUNT(*) as count FROM products WHERE category = ?').get(category) as { count: number };
    return row.count > 0;
  },

  // Content
  getContent(page?: string) {
    if (page) return getDb().prepare('SELECT * FROM site_content WHERE page = ? ORDER BY section, content_key').all(page);
    return getDb().prepare('SELECT * FROM site_content ORDER BY page, section, content_key').all();
  },

  updateContent(id: number, value: string) {
    return getDb().prepare('UPDATE site_content SET content_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(value, id);
  },

  upsertContent(page: string, section: string, key: string, value: string, type: string = 'text') {
    const existing = getDb().prepare('SELECT id FROM site_content WHERE page=? AND section=? AND content_key=?').get(page, section, key);
    if (existing) {
      return getDb().prepare('UPDATE site_content SET content_value=?, updated_at=CURRENT_TIMESTAMP WHERE page=? AND section=? AND content_key=?').run(value, page, section, key);
    }
    return getDb().prepare('INSERT INTO site_content (page, section, content_key, content_value, content_type) VALUES (?,?,?,?,?)').run(page, section, key, value, type);
  },

  // Media
  getMedia() {
    return getDb().prepare('SELECT * FROM media ORDER BY uploaded_at DESC').all();
  },

  addMedia(data: { filename: string; original_name: string; file_path: string; file_size: number; mime_type: string }) {
    return getDb().prepare('INSERT INTO media (filename, original_name, file_path, file_size, mime_type) VALUES (?,?,?,?,?)').run(data.filename, data.original_name, data.file_path, data.file_size, data.mime_type);
  },

  deleteMedia(id: number) {
    return getDb().prepare('DELETE FROM media WHERE id = ?').run(id);
  },

  getMediaById(id: number) {
    return getDb().prepare('SELECT * FROM media WHERE id = ?').get(id);
  },

  // Orders
  getOrders(status?: string) {
    if (status && status !== 'all') return getDb().prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status);
    return getDb().prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  },

  updateOrderStatus(id: number, status: string) {
    return getDb().prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  },
  
  updateOrderStatusByNumber(orderNumber: string, status: string) {
    return getDb().prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_number = ?').run(status, orderNumber);
  },

  getOrderCount() {
    return (getDb().prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
  },

  getRevenue() {
    const result = getDb().prepare("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'").get() as { revenue: number };
    return result.revenue;
  },

  // Settings
  getSettings() {
    const rows = getDb().prepare('SELECT setting_key, setting_value FROM settings').all() as { setting_key: string; setting_value: string }[];
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.setting_key] = r.setting_value;
    return obj;
  },

  updateSetting(key: string, value: string) {
    const existing = getDb().prepare('SELECT id FROM settings WHERE setting_key = ?').get(key);
    if (existing) return getDb().prepare('UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?').run(value, key);
    return getDb().prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)').run(key, value);
  },

  // Admin
  getAdminByUsername(username: string) {
    return getDb().prepare('SELECT * FROM admins WHERE username = ?').get(username) as { id: number; username: string; email: string; password_hash: string; admin_role: string; permissions: string; is_active: number } | undefined;
  },

  getAdminById(id: number) {
    return getDb().prepare('SELECT * FROM admins WHERE id = ?').get(id) as { id: number; username: string; email: string; password_hash: string; admin_role: string; permissions: string; is_active: number } | undefined;
  },

  getAllAdmins() {
    return getDb().prepare('SELECT id, username, email, admin_role, permissions, is_active, created_at FROM admins ORDER BY created_at DESC').all();
  },

  createAdmin(data: { username: string; email: string; password_hash: string; admin_role: string; permissions: string; is_active?: number }) {
    return getDb().prepare('INSERT INTO admins (username, email, password_hash, admin_role, permissions, is_active) VALUES (?, ?, ?, ?, ?, ?)').run(data.username, data.email, data.password_hash, data.admin_role, data.permissions, data.is_active !== undefined ? data.is_active : 1);
  },

  updateAdmin(id: number, data: { username: string; email: string; admin_role: string; permissions: string; is_active?: number }) {
    if (data.is_active !== undefined) {
      return getDb().prepare('UPDATE admins SET username = ?, email = ?, admin_role = ?, permissions = ?, is_active = ? WHERE id = ?').run(data.username, data.email, data.admin_role, data.permissions, data.is_active, id);
    }
    return getDb().prepare('UPDATE admins SET username = ?, email = ?, admin_role = ?, permissions = ? WHERE id = ?').run(data.username, data.email, data.admin_role, data.permissions, id);
  },

  deleteAdmin(id: number) {
    return getDb().prepare('DELETE FROM admins WHERE id = ?').run(id);
  },

  updateAdminPassword(id: number, hash: string) {
    return getDb().prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, id);
  },

  // ─── Users ───
  getUserByEmail(email: string) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: number; name: string; email: string; phone: string; password_hash: string; address: string; city: string } | undefined;
  },

  getUserById(id: number) {
    return getDb().prepare('SELECT id, name, email, phone, address, city, created_at FROM users WHERE id = ?').get(id) as { id: number; name: string; email: string; phone: string; address: string; city: string; created_at: string } | undefined;
  },

  createUser(data: { name: string; email: string; phone: string; password_hash: string }) {
    return getDb().prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?,?,?,?)').run(data.name, data.email, data.phone, data.password_hash);
  },

  getAllUsers() {
    return getDb().prepare('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC').all();
  },

  getUserCount() {
    return (getDb().prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  },

  deleteUser(id: number) {
    // Delete user's cart items
    getDb().prepare('DELETE FROM cart_items WHERE user_id = ?').run(id);
    // Delete wishlist items
    getDb().prepare('DELETE FROM wishlist WHERE user_id = ?').run(id);
    // Delete the user
    return getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
  },

  // ─── Cart ───
  getCartItems(userId: number) {
    return getDb().prepare(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.original_price, p.image, p.category, p.stock, p.weight, p.weight_unit, p.min_order_quantity
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? ORDER BY ci.id DESC
    `).all(userId);
  },

  addToCart(userId: number, productId: number, quantity: number = 1) {
    const product = getDb().prepare('SELECT stock FROM products WHERE id = ?').get(productId) as { stock: number } | undefined;
    if (!product) throw { type: 'PRODUCT_NOT_FOUND' };
    
    const existing = getDb().prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, productId) as { id: number; quantity: number } | undefined;
    const newTotal = (existing?.quantity || 0) + quantity;
    if (newTotal > product.stock) {
      throw { type: 'STOCK_EXCEEDED', available: product.stock, inCart: existing?.quantity || 0 };
    }

    if (existing) {
      return getDb().prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newTotal, existing.id);
    }
    return getDb().prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?,?,?)').run(userId, productId, quantity);
  },

  updateCartQuantity(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) {
      return getDb().prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    }
    const product = getDb().prepare('SELECT stock FROM products WHERE id = ?').get(productId) as { stock: number } | undefined;
    if (product && quantity > product.stock) {
      throw { type: 'STOCK_EXCEEDED', available: product.stock };
    }
    return getDb().prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?').run(quantity, userId, productId);
  },

  removeFromCart(userId: number, productId: number) {
    return getDb().prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
  },

  clearCart(userId: number) {
    return getDb().prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  },

  getCartCount(userId: number) {
    const r = getDb().prepare('SELECT COALESCE(SUM(quantity),0) as count FROM cart_items WHERE user_id = ?').get(userId) as { count: number };
    return r.count;
  },

  // ─── Orders (extended) ───
  createOrder(data: { order_number: string; user_id: number | null; customer_name: string; customer_email: string; customer_phone: string; items_json: string; subtotal: number; shipping: number; total: number; shipping_address: string; shipping_city: string; shipping_zip: string; payment_method: string; coupon_code: string | null; discount_amount: number; payment_slip: string | null; status: string }) {
    return getDb().prepare('INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, items_json, subtotal, shipping, total, shipping_address, shipping_city, shipping_zip, payment_method, coupon_code, discount_amount, payment_slip, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
      data.order_number, data.user_id, data.customer_name, data.customer_email, data.customer_phone, data.items_json, data.subtotal, data.shipping, data.total, data.shipping_address, data.shipping_city, data.shipping_zip, data.payment_method, data.coupon_code, data.discount_amount, data.payment_slip, data.status
    );
  },

  checkoutTransaction(data: {
    items: Array<{ product_id: number; name: string; quantity: number; price: number }>;
    orderData: {
      order_number: string; user_id: number | null; customer_name: string; customer_email: string; customer_phone: string; items_json: string; subtotal: number; shipping: number; total: number; shipping_address: string; shipping_city: string; shipping_zip: string; payment_method: string; coupon_code: string | null; discount_amount: number; payment_slip: string | null; status: string;
    };
    couponCode?: string;
    userId?: number | null;
  }) {
    const txn = getDb().transaction(() => {
      // 1. Validate + decrement stock atomically
      for (const item of data.items) {
        const result = getDb().prepare(
          'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stock >= ?'
        ).run(item.quantity, item.product_id, item.quantity);
        
        if (result.changes === 0) {
          const product = getDb().prepare('SELECT name, stock FROM products WHERE id = ?').get(item.product_id) as { name: string; stock: number } | undefined;
          throw { type: 'STOCK_INSUFFICIENT', product: item.name, available: product?.stock ?? 0 };
        }
      }

      // 2. Create the order
      getDb().prepare('INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, items_json, subtotal, shipping, total, shipping_address, shipping_city, shipping_zip, payment_method, coupon_code, discount_amount, payment_slip, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
        data.orderData.order_number, data.orderData.user_id, data.orderData.customer_name, data.orderData.customer_email, data.orderData.customer_phone, data.orderData.items_json, data.orderData.subtotal, data.orderData.shipping, data.orderData.total, data.orderData.shipping_address, data.orderData.shipping_city, data.orderData.shipping_zip, data.orderData.payment_method, data.orderData.coupon_code, data.orderData.discount_amount, data.orderData.payment_slip, data.orderData.status
      );

      // 3. Increment coupon usage atomically
      if (data.couponCode) {
        getDb().prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ? COLLATE NOCASE').run(data.couponCode);
      }

      // 4. Clear cart if user
      if (data.userId) {
        getDb().prepare('DELETE FROM cart_items WHERE user_id = ?').run(data.userId);
      }
    });
    return txn();
  },

  getUserOrders(userId: number) {
    return getDb().prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  getOrderById(id: number) {
    return getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id);
  },

  // ─── Product Images ───
  getProductImages(productId: number) {
    return getDb().prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(productId) as { id: number; product_id: number; image_url: string; sort_order: number }[];
  },

  setProductImages(productId: number, images: string[]) {
    getDb().prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
    const stmt = getDb().prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)');
    images.forEach((url, i) => stmt.run(productId, url, i));
  },

  // ─── Reviews ───
  getReviews(productId: number) {
    return getDb().prepare(`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? ORDER BY r.created_at DESC
    `).all(productId);
  },

  addReview(productId: number, userId: number, rating: number, comment: string) {
    return getDb().prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)').run(productId, userId, rating, comment);
  },

  getProductRating(productId: number) {
    const r = getDb().prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ?').get(productId) as { avg: number | null; count: number };
    return { average: r.avg ? Math.round(r.avg * 10) / 10 : 0, count: r.count };
  },

  hasUserReviewed(productId: number, userId: number) {
    const r = getDb().prepare('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?').get(productId, userId);
    return !!r;
  },

  // ─── Questions ───
  getQuestions(productId: number) {
    return getDb().prepare(`
      SELECT q.*, u.name as user_name FROM questions q
      JOIN users u ON q.user_id = u.id
      WHERE q.product_id = ? ORDER BY q.created_at DESC
    `).all(productId);
  },

  addQuestion(productId: number, userId: number, question: string) {
    return getDb().prepare('INSERT INTO questions (product_id, user_id, question) VALUES (?,?,?)').run(productId, userId, question);
  },

  answerQuestion(id: number, answer: string) {
    return getDb().prepare('UPDATE questions SET answer = ?, answered_at = CURRENT_TIMESTAMP WHERE id = ?').run(answer, id);
  },

  getAllQuestions(unansweredOnly: boolean = false) {
    const where = unansweredOnly ? "WHERE q.answer = '' OR q.answer IS NULL" : '';
    return getDb().prepare(`
      SELECT q.*, u.name as user_name, p.name as product_name FROM questions q
      JOIN users u ON q.user_id = u.id
      JOIN products p ON q.product_id = p.id
      ${where} ORDER BY q.created_at DESC
    `).all();
  },

  // ─── Wishlist ───
  getWishlist(userId: number) {
    return getDb().prepare(`
      SELECT w.product_id, p.name, p.price, p.original_price, p.image, p.category
      FROM wishlist w JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ? ORDER BY w.id DESC
    `).all(userId);
  },

  isInWishlist(userId: number, productId: number) {
    return !!getDb().prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, productId);
  },

  toggleWishlist(userId: number, productId: number) {
    const existing = getDb().prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, productId);
    if (existing) {
      getDb().prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(userId, productId);
      return false;
    }
    getDb().prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?,?)').run(userId, productId);
    return true;
  },

  // Stats
  getStats() {
    const products = this.getProductCount();
    const orders = this.getOrderCount();
    const revenue = this.getRevenue();
    const featured = (getDb().prepare('SELECT COUNT(*) as count FROM products WHERE is_featured = 1').get() as { count: number }).count;
    const pending = (getDb().prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as { count: number }).count;
    const users = this.getUserCount();
    return { products, orders, revenue, featured, pending, users };
  },

  // ─── News Articles ───
  getNewsArticles(limit?: number) {
    const lim = limit ? `LIMIT ${limit}` : '';
    return getDb().prepare(`SELECT * FROM news_articles WHERE status = 'active' ORDER BY published_at DESC ${lim}`).all();
  },

  getAllNewsArticles() {
    return getDb().prepare('SELECT * FROM news_articles ORDER BY created_at DESC').all();
  },

  getNewsBySlug(slug: string) {
    return getDb().prepare('SELECT * FROM news_articles WHERE slug = ?').get(slug);
  },

  createNews(data: Record<string, unknown>) {
    const stmt = getDb().prepare(`INSERT INTO news_articles (title, slug, excerpt, content, image_url, status) VALUES (?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.title, data.slug, data.excerpt || '', data.content, data.image_url || 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg', data.status || 'active');
  },

  updateNews(id: number, data: Record<string, unknown>) {
    const stmt = getDb().prepare(`UPDATE news_articles SET title=?, slug=?, excerpt=?, content=?, image_url=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    return stmt.run(data.title, data.slug, data.excerpt || '', data.content, data.image_url, data.status, id);
  },

  deleteNews(id: number) {
    return getDb().prepare('DELETE FROM news_articles WHERE id = ?').run(id);
  },

  // ─── FAQs ───
  getFaqs(category?: string) {
    if (category && category !== 'all') {
      return getDb().prepare('SELECT * FROM faqs WHERE category = ? ORDER BY sort_order ASC, created_at DESC').all(category);
    }
    return getDb().prepare('SELECT * FROM faqs ORDER BY category, sort_order ASC').all();
  },

  getAllFaqs() {
    return getDb().prepare('SELECT * FROM faqs ORDER BY category, sort_order ASC').all();
  },

  getFaqById(id: number) {
    return getDb().prepare('SELECT * FROM faqs WHERE id = ?').get(id);
  },

  createFaq(data: Record<string, unknown>) {
    const stmt = getDb().prepare(`INSERT INTO faqs (category, question, answer, sort_order) VALUES (?, ?, ?, ?)`);
    return stmt.run(data.category, data.question, data.answer, data.sort_order || 0);
  },

  updateFaq(id: number, data: Record<string, unknown>) {
    const stmt = getDb().prepare(`UPDATE faqs SET category=?, question=?, answer=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    return stmt.run(data.category, data.question, data.answer, data.sort_order, id);
  },

  deleteFaq(id: number) {
    return getDb().prepare('DELETE FROM faqs WHERE id = ?').run(id);
  },

  getFaqCategories() {
    return getDb().prepare('SELECT DISTINCT category FROM faqs ORDER BY category ASC').all();
  },

  // ─── Careers & Jobs ───
  getJobs(status?: string) {
    if (status) return getDb().prepare('SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC').all(status);
    return getDb().prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
  },

  getJobById(id: number) {
    return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  },

  createJob(data: Record<string, unknown>) {
    const stmt = getDb().prepare(`INSERT INTO jobs (title, department, location, type, description, requirements, benefits, form_config_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.title, data.department, data.location || 'Balapitiya', data.type || 'Full-time', data.description, data.requirements, data.benefits, data.form_config_json, data.status || 'open');
  },

  updateJob(id: number, data: Record<string, unknown>) {
    const stmt = getDb().prepare(`UPDATE jobs SET title=?, department=?, location=?, type=?, description=?, requirements=?, benefits=?, form_config_json=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    return stmt.run(data.title, data.department, data.location, data.type, data.description, data.requirements, data.benefits, data.form_config_json, data.status, id);
  },

  deleteJob(id: number) {
    return getDb().prepare('DELETE FROM jobs WHERE id = ?').run(id);
  },

  // ─── Job Applications ───
  getApplications(jobId?: number) {
    if (jobId) return getDb().prepare('SELECT ja.*, j.title as job_title FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE ja.job_id = ? ORDER BY ja.created_at DESC').all(jobId);
    return getDb().prepare('SELECT ja.*, j.title as job_title FROM job_applications ja JOIN jobs j ON ja.job_id = j.id ORDER BY ja.created_at DESC').all();
  },

  createApplication(data: Record<string, unknown>) {
    const stmt = getDb().prepare(`INSERT INTO job_applications (job_id, candidate_name, candidate_email, candidate_phone, cv_url, message, custom_answers_json) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.job_id, data.candidate_name, data.candidate_email, data.candidate_phone, data.cv_url, data.message, data.custom_answers_json);
  },

  updateApplicationStatus(id: number, status: string) {
    return getDb().prepare('UPDATE job_applications SET status = ? WHERE id = ?').run(status, id);
  },

  // ─── Hero Slides ───
  getHeroSlides(activeOnly: boolean = false) {
    if (activeOnly) return getDb().prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC').all();
    return getDb().prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC').all();
  },

  getHeroSlide(id: number) {
    return getDb().prepare('SELECT * FROM hero_slides WHERE id = ?').get(id);
  },

  createHeroSlide(data: Record<string, unknown>) {
    const maxOrder = (getDb().prepare('SELECT MAX(sort_order) as m FROM hero_slides').get() as { m: number | null }).m || 0;
    return getDb().prepare('INSERT INTO hero_slides (title, subtitle, label, image, image_mobile, link_url, link_text, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?,?)').run(
      data.title || '', data.subtitle || '', data.label || '', data.image, data.image_mobile || null, data.link_url || '/shop', data.link_text || 'SHOP NOW', maxOrder + 1, data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    );
  },

  updateHeroSlide(id: number, data: Record<string, unknown>) {
    return getDb().prepare('UPDATE hero_slides SET title=?, subtitle=?, label=?, image=?, image_mobile=?, link_url=?, link_text=?, sort_order=?, is_active=? WHERE id=?').run(
      data.title, data.subtitle, data.label, data.image, data.image_mobile || null, data.link_url, data.link_text, data.sort_order, data.is_active ? 1 : 0, id
    );
  },

  deleteHeroSlide(id: number) {
    return getDb().prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
  },

  // ─── Newsletter ───
  addSubscriber(email: string) {
    try {
      return getDb().prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);
    } catch {
      // Already exists — reactivate
      return getDb().prepare('UPDATE newsletter_subscribers SET is_active = 1 WHERE email = ?').run(email);
    }
  },

  getSubscribers() {
    return getDb().prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all();
  },

  getSubscriberCount() {
    return (getDb().prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1').get() as { count: number }).count;
  },

  deleteSubscriber(id: number) {
    return getDb().prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(id);
  },

  // ─── Brands ───
  getBrands(activeOnly: boolean = false) {
    if (activeOnly) return getDb().prepare('SELECT * FROM brands WHERE is_active = 1 ORDER BY sort_order ASC').all();
    return getDb().prepare('SELECT * FROM brands ORDER BY sort_order ASC').all();
  },

  createBrand(data: Record<string, unknown>) {
    const maxOrder = (getDb().prepare('SELECT MAX(sort_order) as m FROM brands').get() as { m: number | null }).m || 0;
    return getDb().prepare('INSERT INTO brands (name, image, sort_order, is_active) VALUES (?,?,?,?)').run(
      data.name, data.image, maxOrder + 1, data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    );
  },

  deleteBrand(id: number) {
    return getDb().prepare('DELETE FROM brands WHERE id = ?').run(id);
  },

  // ─── Product Info Cards ───
  getProductInfoCards(activeOnly: boolean = false) {
    if (activeOnly) return getDb().prepare('SELECT * FROM product_info_cards WHERE is_active = 1 ORDER BY sort_order ASC').all();
    return getDb().prepare('SELECT * FROM product_info_cards ORDER BY sort_order ASC').all();
  },

  getProductInfoBySlug(slug: string) {
    return getDb().prepare('SELECT * FROM product_info_cards WHERE slug = ?').get(slug);
  },

  createProductInfoCard(data: Record<string, unknown>) {
    const maxOrder = (getDb().prepare('SELECT MAX(sort_order) as m FROM product_info_cards').get() as { m: number | null }).m || 0;
    return getDb().prepare('INSERT INTO product_info_cards (title, subtitle, description, image, slug, detail_content, detail_image, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?,?)').run(
      data.title, data.subtitle || '', data.description || '', data.image, data.slug, data.detail_content || '', data.detail_image || '', maxOrder + 1, data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    );
  },

  updateProductInfoCard(id: number, data: Record<string, unknown>) {
    return getDb().prepare('UPDATE product_info_cards SET title=?, subtitle=?, description=?, image=?, slug=?, detail_content=?, detail_image=?, sort_order=?, is_active=? WHERE id=?').run(
      data.title, data.subtitle, data.description, data.image, data.slug, data.detail_content, data.detail_image, data.sort_order, data.is_active ? 1 : 0, id
    );
  },

  deleteProductInfoCard(id: number) {
    return getDb().prepare('DELETE FROM product_info_cards WHERE id = ?').run(id);
  },

  // ─── Coupons ───
  getCouponByCode(code: string) {
    return getDb().prepare('SELECT * FROM coupons WHERE code = ? COLLATE NOCASE AND is_active = 1').get(code) as any;
  },

  getAllCoupons() {
    return getDb().prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  },

  createCoupon(data: Record<string, unknown>) {
    return getDb().prepare('INSERT INTO coupons (code, discount_type, discount_value, min_spend, usage_limit) VALUES (?,?,?,?,?)').run(
      (data.code as string).toUpperCase(), data.discount_type, data.discount_value, data.min_spend || 0, data.usage_limit || null
    );
  },

  incrementCouponUsage(code: string) {
    return getDb().prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ? COLLATE NOCASE').run(code);
  },

  // ─── Returns ───
  createReturnRequest(data: Record<string, any>) {
    return getDb().prepare('INSERT INTO return_requests (order_id, user_id, order_number, reason, details, image_url) VALUES (?,?,?,?,?,?)').run(
      data.order_id, data.user_id, data.order_number, data.reason, data.details, data.image_url
    );
  },

  getAllReturnRequests() {
    return getDb().prepare('SELECT * FROM return_requests ORDER BY created_at DESC').all();
  },

  updateReturnStatus(id: number, status: string) {
    return getDb().prepare('UPDATE return_requests SET status = ? WHERE id = ?').run(status, id);
  },

  getOrderForTracking(orderNumber: string, identifier: string) {
    // Identifier can be email or phone
    return getDb().prepare('SELECT * FROM orders WHERE order_number = ? AND (customer_email = ? OR customer_phone = ?)').get(orderNumber, identifier, identifier) as any;
  },

  getUserReturns(userId: number) {
    return getDb().prepare('SELECT * FROM return_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  },

  getOrderByNumber(orderNumber: string) {
    return getDb().prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
  }
};
