import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  const reviews = db.getReviews(productId);
  const rating = db.getProductRating(productId);
  return NextResponse.json({ reviews, rating });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const { id } = await params;
  const productId = parseInt(id);
  const { rating, comment } = await request.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating 1-5 required' }, { status: 400 });
  if (db.hasUserReviewed(productId, session.id)) {
    return NextResponse.json({ error: 'You already reviewed this product' }, { status: 409 });
  }
  db.addReview(productId, session.id, rating, comment || '');
  const reviews = db.getReviews(productId);
  const ratingData = db.getProductRating(productId);
  return NextResponse.json({ success: true, reviews, rating: ratingData }, { status: 201 });
}
