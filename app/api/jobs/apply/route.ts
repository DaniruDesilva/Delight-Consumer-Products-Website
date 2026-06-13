import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const customAnswers = formData.get('customAnswers') as string;
    const cvFile = formData.get('cv') as File | null;

    if (!jobId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let cvUrl = null;
    if (cvFile) {
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (cloudName && cloudName !== 'your_cloud_name') {
        const { uploadPrivateDocument } = require('@/lib/cloudinary');
        const result = await uploadPrivateDocument(buffer, cvFile.name, 'delight_cvs');
        cvUrl = result.publicId; // Store public_id instead of url
      } else {
        // Fallback strictly if Cloudinary is misconfigured
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'applications');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const ext = path.extname(cvFile.name);
        const filename = `CV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        cvUrl = `/uploads/applications/${filename}`;
      }
    }

    db.createApplication({
      job_id: parseInt(jobId),
      candidate_name: name,
      candidate_email: email,
      candidate_phone: phone,
      cv_url: cvUrl,
      message,
      custom_answers_json: customAnswers
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Application error:', err);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
