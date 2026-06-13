import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, setUserSessionCookie } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(new URL('/?login_error=missing_code', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?login_error=missing_config', request.url));
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token error:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/?login_error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();

    // 2. Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Google profile error:', await profileResponse.text());
      return NextResponse.redirect(new URL('/?login_error=profile_failed', request.url));
    }

    const profileData = await profileResponse.json();
    const googleId = profileData.id;
    const email = profileData.email;
    const name = profileData.name;

    if (!email) {
      return NextResponse.redirect(new URL('/?login_error=no_email', request.url));
    }

    // 3. Find or Create User in DB
    let user = db.instance.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (user) {
      // User exists, ensure google_id is linked if it wasn't already
      if (!user.google_id) {
        db.instance.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, user.id);
      }
    } else {
      // Create new user. Use a dummy hash for password_hash.
      const result = db.instance.prepare(`
        INSERT INTO users (name, email, password_hash, google_id)
        VALUES (?, ?, ?, ?)
      `).run(name, email, '*GOOGLE*', googleId);
      
      user = {
        id: result.lastInsertRowid,
        name,
        email,
        role: 'user',
      };
    }

    // 4. Create JWT Session
    const token = await createToken({ 
      id: user.id, 
      username: user.name, 
      email: user.email, 
      role: 'user' 
    });

    await setUserSessionCookie(token);

    // 5. Redirect back to homepage or account
    return NextResponse.redirect(new URL('/account', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?login_error=internal_error', request.url));
  }
}
