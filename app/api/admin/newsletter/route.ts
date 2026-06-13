import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const subscribers = db.getSubscribers();
  const count = db.getSubscriberCount();
  return NextResponse.json({ subscribers, count });
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    db.deleteSubscriber(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
