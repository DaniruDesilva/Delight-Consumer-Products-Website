/**
 * lib/cloudinary.ts
 * Cloudinary upload and URL helper for Delight website.
 * Handles server-side uploads and generates optimized URLs.
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - File data as Buffer
 * @param filename - Original filename (used to generate public_id)
 * @param folder - Cloudinary folder (default: 'delight')
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string = 'delight'
): Promise<{ url: string; publicId: string; format: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'delight_uploads',
        resource_type: 'image',
        // Auto-optimize quality and format
        quality: 'auto',
        fetch_format: 'auto',
        // Generate a unique public_id from filename
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload a private document to Cloudinary (e.g. CVs).
 * These files cannot be accessed publicly without a signed URL.
 */
export async function uploadPrivateDocument(
  buffer: Buffer,
  filename: string,
  folder: string = 'delight_cvs'
): Promise<{ url: string; publicId: string; format: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        type: 'private', // Ensures the file is strictly private
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generate a signed URL for a private Cloudinary document.
 */
export function getPrivateDownloadUrl(publicId: string): string {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'private',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
  });
}

/**
 * Generate an optimized Cloudinary URL for a given public ID.
 * Automatically serves WebP/AVIF based on browser support.
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    crop?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: 'auto',
    quality: options.quality || 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
  });
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

export default cloudinary;
