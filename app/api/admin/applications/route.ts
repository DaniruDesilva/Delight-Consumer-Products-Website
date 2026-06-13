import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId') ? parseInt(searchParams.get('jobId')!) : undefined;

  const applications = db.getApplications(jobId);

  // Generate signed URLs dynamically for any CVs hosted privately on Cloudinary
  const enrichedApplications = applications.map((app: any) => {
    let finalUrl = app.cv_url;
    // If it looks like a Cloudinary public ID (doesn't start with /uploads)
    if (finalUrl && !finalUrl.startsWith('/uploads/')) {
      try {
        finalUrl = require('@/lib/cloudinary').getPrivateDownloadUrl(finalUrl);
      } catch (e) {
        console.error('Failed to sign URL:', e);
      }
    }
    return { ...app, cv_url: finalUrl };
  });

  return NextResponse.json({ applications: enrichedApplications });
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    if (!data.id || !data.status) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    db.updateApplicationStatus(data.id, data.status);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
