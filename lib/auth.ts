import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'delight-admin-secret-key-2026');
const ADMIN_COOKIE = 'delight_admin_session';
const USER_COOKIE = 'delight_user_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: { id: number; username?: string; email?: string; role: 'admin' | 'user'; admin_role?: string; permissions?: string[] }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; username?: string; email?: string; role: 'admin' | 'user'; admin_role?: string; permissions?: string[] };
  } catch {
    return null;
  }
}

// Admin session
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminSession() {
  return getSession();
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// User session
export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'user') return null;
  return payload;
}

export async function setUserSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearUserSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
}

export { ADMIN_COOKIE, USER_COOKIE };
