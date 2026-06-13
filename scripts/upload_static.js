const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Manually load .env variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').replace(/^['"]|['"]$/g, '');
    }
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadToCloudinary(filePath, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const filesToUpload = [
  'Logo.webp',
  'about_hero.webp',
  'factory_craft.webp',
  'contact_hero.webp'
];

async function run() {
  const urls = {};
  for (const file of filesToUpload) {
    const filePath = path.join(PUBLIC_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${file}...`);
      const res = await uploadToCloudinary(filePath, 'delight_static');
      urls[file] = res.secure_url;
    } else {
      console.log(`File not found: ${file}`);
    }
  }
  fs.writeFileSync('cloudinary_static_urls.json', JSON.stringify(urls, null, 2));
  console.log('Done:', urls);
}

run().catch(console.error);
