import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const media = db.getMedia();
  return NextResponse.json({ media });
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const media = db.getMediaById(id);
    if (media) {
      const fs = await import('fs');
      const path = await import('path');
      const m = media as { file_path: string };
      const filePath = path.join(process.cwd(), 'public', m.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      db.deleteMedia(id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
