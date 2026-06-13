import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setUserSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const token = await createToken({ id: user.id, email: user.email, role: 'user' });
    await setUserSessionCookie(token);
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
