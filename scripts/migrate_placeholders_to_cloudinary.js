const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const cloudinary = require('cloudinary').v2;

// Manually load .env variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const localEnvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(localEnvPath)) {
  const envConfig = fs.readFileSync(localEnvPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const DB_PATH = path.join(__dirname, '..', 'data', 'delight.db');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const db = new Database(DB_PATH);

async function uploadToCloudinary(filePath, folder, resourceType = 'image', type = 'upload') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,
        type: type,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

const isLocalPath = (url) => url && typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');

function findPhysicalFile(logicalPath) {
  let p = path.join(PUBLIC_DIR, logicalPath);
  if (fs.existsSync(p)) return p;
  
  // Try changing extension to .webp
  if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg')) {
     const webpPath = p.replace(/\.(png|jpg|jpeg)$/i, '.webp');
     if (fs.existsSync(webpPath)) return webpPath;
  }
  
  // Try without extension
  if (fs.existsSync(p + '.webp')) return p + '.webp';

  return null;
}

async function migratePlaceholders() {
  console.log('Starting Cloudinary Placeholder Migration...');

  // 1. site_content
  const contents = db.prepare('SELECT id, content_value FROM site_content WHERE content_type = ?').all('image');
  for (const row of contents) {
    if (isLocalPath(row.content_value)) {
      const physicalFile = findPhysicalFile(row.content_value);
      if (physicalFile) {
        console.log(`Migrating content image: ${row.content_value} (from ${physicalFile})`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight');
          db.prepare('UPDATE site_content SET content_value = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 2. products
  const products = db.prepare('SELECT id, image FROM products').all();
  for (const row of products) {
    if (isLocalPath(row.image)) {
      const physicalFile = findPhysicalFile(row.image);
      if (physicalFile) {
        console.log(`Migrating product image: ${row.image} (from ${physicalFile})`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight_products');
          db.prepare('UPDATE products SET image = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 3. brands
  const brands = db.prepare('SELECT id, image FROM brands').all();
  for (const row of brands) {
    if (isLocalPath(row.image)) {
      const physicalFile = findPhysicalFile(row.image);
      if (physicalFile) {
        console.log(`Migrating brand image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight_brands');
          db.prepare('UPDATE brands SET image = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 4. hero_slides
  const slides = db.prepare('SELECT id, image FROM hero_slides').all();
  for (const row of slides) {
    if (isLocalPath(row.image)) {
      const physicalFile = findPhysicalFile(row.image);
      if (physicalFile) {
        console.log(`Migrating slide image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight_hero');
          db.prepare('UPDATE hero_slides SET image = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 5. product_info_cards
  const product_info_cards = db.prepare('SELECT id, image, detail_image FROM product_info_cards').all();
  for (const row of product_info_cards) {
    if (isLocalPath(row.image)) {
      const physicalFile = findPhysicalFile(row.image);
      if (physicalFile) {
        console.log(`Migrating product_info_cards image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight_products');
          db.prepare('UPDATE product_info_cards SET image = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
    if (isLocalPath(row.detail_image)) {
      const physicalFile = findPhysicalFile(row.detail_image);
      if (physicalFile) {
        console.log(`Migrating product_info_cards detail_image: ${row.detail_image}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight_products');
          db.prepare('UPDATE product_info_cards SET detail_image = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 6. settings (popup image, etc)
  const settings = db.prepare("SELECT id, setting_key, setting_value FROM settings WHERE setting_key LIKE '%image%'").all();
  for (const row of settings) {
    if (isLocalPath(row.setting_value)) {
      const physicalFile = findPhysicalFile(row.setting_value);
      if (physicalFile) {
        console.log(`Migrating setting image: ${row.setting_key} = ${row.setting_value}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight');
          db.prepare('UPDATE settings SET setting_value = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 7. news_articles
  const news_articles = db.prepare('SELECT id, image_url FROM news_articles').all();
  for (const row of news_articles) {
    if (isLocalPath(row.image_url)) {
      const physicalFile = findPhysicalFile(row.image_url);
      if (physicalFile) {
        console.log(`Migrating news_articles image: ${row.image_url}`);
        try {
          const res = await uploadToCloudinary(physicalFile, 'delight');
          db.prepare('UPDATE news_articles SET image_url = ? WHERE id = ?').run(res.secure_url, row.id);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  console.log('Cleaning up remaining local public webp/png files...');
  // Instead of risking deleting things we need, we will just manually find and delete .webp and .png that are our placeholders.
  // We'll leave it for another step to actually delete the physical files after we verify the DB is good.
  console.log('Migration Complete!');
}

migratePlaceholders().catch(console.error);
