import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questions = db.getQuestions(parseInt(id));
  return NextResponse.json({ questions });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const { id } = await params;
  const { question } = await request.json();
  if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 });
  db.addQuestion(parseInt(id), session.id, question.trim());
  const questions = db.getQuestions(parseInt(id));
  return NextResponse.json({ success: true, questions }, { status: 201 });
}
