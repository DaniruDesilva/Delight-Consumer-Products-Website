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

async function migrate() {
  console.log('Starting Cloudinary Migration...');

  // 1. site_content
  const contents = db.prepare('SELECT id, content_value FROM site_content WHERE content_type = ?').all('image');
  for (const row of contents) {
    if (isLocalPath(row.content_value)) {
      const localPath = path.join(PUBLIC_DIR, row.content_value);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating content image: ${row.content_value}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight');
          db.prepare('UPDATE site_content SET content_value = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 2. products
  const products = db.prepare('SELECT id, image FROM products').all();
  for (const row of products) {
    if (isLocalPath(row.image)) {
      const localPath = path.join(PUBLIC_DIR, row.image);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating product image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_products');
          db.prepare('UPDATE products SET image = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 3. brands
  const brands = db.prepare('SELECT id, image FROM brands').all();
  for (const row of brands) {
    if (isLocalPath(row.image)) {
      const localPath = path.join(PUBLIC_DIR, row.image);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating brand image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_brands');
          db.prepare('UPDATE brands SET image = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 5. hero_slides
  const slides = db.prepare('SELECT id, image FROM hero_slides').all();
  for (const row of slides) {
    if (isLocalPath(row.image)) {
      const localPath = path.join(PUBLIC_DIR, row.image);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating slide image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_hero');
          db.prepare('UPDATE hero_slides SET image = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 6. Job Applications (CVs)
  const applications = db.prepare('SELECT id, cv_url FROM job_applications').all();
  for (const row of applications) {
    if (isLocalPath(row.cv_url)) {
      const localPath = path.join(PUBLIC_DIR, row.cv_url);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating CV: ${row.cv_url}`);
        try {
          // CVs are private
          const res = await uploadToCloudinary(localPath, 'delight_cvs', 'raw', 'private');
          db.prepare('UPDATE job_applications SET cv_url = ? WHERE id = ?').run(res.public_id, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 7. product_images
  const product_images = db.prepare('SELECT id, image_url FROM product_images').all();
  for (const row of product_images) {
    if (isLocalPath(row.image_url)) {
      const localPath = path.join(PUBLIC_DIR, row.image_url);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating product image secondary: ${row.image_url}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_products');
          db.prepare('UPDATE product_images SET image_url = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 8. product_info_cards
  const product_info_cards = db.prepare('SELECT id, image, detail_image FROM product_info_cards').all();
  for (const row of product_info_cards) {
    if (isLocalPath(row.image)) {
      const localPath = path.join(PUBLIC_DIR, row.image);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating product_info_cards image: ${row.image}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_products');
          db.prepare('UPDATE product_info_cards SET image = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
    if (isLocalPath(row.detail_image)) {
      const localPath = path.join(PUBLIC_DIR, row.detail_image);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating product_info_cards detail_image: ${row.detail_image}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_products');
          db.prepare('UPDATE product_info_cards SET detail_image = ? WHERE id = ?').run(res.secure_url, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  // 9. media
  const media = db.prepare('SELECT id, file_path FROM media').all();
  for (const row of media) {
    if (isLocalPath(row.file_path)) {
      const localPath = path.join(PUBLIC_DIR, row.file_path);
      if (fs.existsSync(localPath)) {
        console.log(`Migrating media: ${row.file_path}`);
        try {
          const res = await uploadToCloudinary(localPath, 'delight_admin');
          db.prepare('UPDATE media SET file_path = ?, filename = ? WHERE id = ?').run(res.secure_url, res.public_id, row.id);
          fs.unlinkSync(localPath);
        } catch (e) { console.error(e.message); }
      }
    }
  }

  console.log('Migration Complete!');
}

migrate().catch(console.error);
