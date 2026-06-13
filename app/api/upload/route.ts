import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use Cloudinary directly, removing local fallback
    const result = await uploadToCloudinary(buffer, file.name, 'delight');

    // Track in media table
    db.addMedia({
      filename: result.publicId,
      original_name: file.name,
      file_path: result.url,
      file_size: file.size,
      mime_type: file.type,
    });

    return NextResponse.json({
      success: true,
      path: result.url,
      filename: result.publicId,
      provider: 'cloudinary',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
