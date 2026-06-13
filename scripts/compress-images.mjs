/**
 * scripts/compress-images.mjs
 * One-time script to compress existing PNG images in /public to WebP.
 * Run with: node scripts/compress-images.mjs
 * 
 * This significantly reduces file sizes (700-860KB PNGs → ~50-120KB WebP)
 * for local fallback images that haven't been migrated to Cloudinary yet.
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Images to skip (very small, logos, SVGs)
const SKIP_FILES = ['file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg'];

async function getImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip uploads directory (these are user-uploaded, handle separately)
      if (entry.name === 'uploads') continue;
      const subFiles = await getImageFiles(join(dir, entry.name));
      files.push(...subFiles);
    } else if (['.png', '.jpg', '.jpeg'].includes(extname(entry.name).toLowerCase())) {
      if (!SKIP_FILES.includes(entry.name)) {
        files.push(join(dir, entry.name));
      }
    }
  }
  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressImage(filePath) {
  const fileInfo = await stat(filePath);
  const originalSize = fileInfo.size;
  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath, ext);
  const dir = filePath.replace(basename(filePath), '');
  
  // Compress PNG to optimized PNG (preserve PNG format for compatibility)
  const outputPath = filePath; // overwrite in place
  
  try {
    const compressed = await sharp(filePath)
      .png({ quality: 85, compressionLevel: 9, effort: 10 })
      .toBuffer();

    // Also create WebP version for modern browsers
    const webpPath = join(dir, `${name}.webp`);
    await sharp(filePath)
      .webp({ quality: 82, effort: 6 })
      .toFile(webpPath);

    const webpInfo = await stat(webpPath);
    
    console.log(`✅ ${basename(filePath)}`);
    console.log(`   PNG:  ${formatBytes(originalSize)} → (kept, use WebP above for new uploads)`);
    console.log(`   WebP: ${formatBytes(webpInfo.size)} (${Math.round((1 - webpInfo.size / originalSize) * 100)}% smaller)`);
    
    return { original: originalSize, webp: webpInfo.size };
  } catch (err) {
    console.error(`❌ Failed to compress ${basename(filePath)}:`, err.message);
    return { original: originalSize, webp: originalSize };
  }
}

async function main() {
  console.log('🔍 Scanning /public for images...\n');
  
  const files = await getImageFiles(PUBLIC_DIR);
  
  if (files.length === 0) {
    console.log('No images found to compress.');
    return;
  }

  console.log(`Found ${files.length} image(s) to process:\n`);
  
  let totalOriginal = 0;
  let totalWebP = 0;

  for (const file of files) {
    const result = await compressImage(file);
    totalOriginal += result.original;
    totalWebP += result.webp;
  }

  console.log('\n─────────────────────────────────');
  console.log(`📊 Summary:`);
  console.log(`   Original total: ${formatBytes(totalOriginal)}`);
  console.log(`   WebP total:     ${formatBytes(totalWebP)}`);
  console.log(`   Savings:        ${formatBytes(totalOriginal - totalWebP)} (${Math.round((1 - totalWebP / totalOriginal) * 100)}% smaller)`);
  console.log('\n✅ Done! WebP versions created alongside originals.');
  console.log('💡 Upload images to Cloudinary via your admin panel for automatic CDN delivery.');
}

main().catch(console.error);
