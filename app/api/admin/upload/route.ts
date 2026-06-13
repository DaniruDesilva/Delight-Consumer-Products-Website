import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { uploadToCloudinary } = require('@/lib/cloudinary');
    const result = await uploadToCloudinary(buffer, file.name, 'delight_admin');

    db.addMedia({
      filename: result.publicId,
      original_name: file.name,
      file_path: result.url,
      file_size: file.size,
      mime_type: file.type,
    });

    return NextResponse.json({ success: true, path: result.url, filename: result.publicId });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
