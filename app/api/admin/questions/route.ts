import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const questions = db.getAllQuestions();
  return NextResponse.json({ questions });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, answer } = await request.json();
  if (!id || !answer?.trim()) return NextResponse.json({ error: 'ID and answer required' }, { status: 400 });
  db.answerQuestion(id, answer.trim());
  return NextResponse.json({ success: true });
}
