import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store in DB
    db.instance.prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)').run(email, token, expiresAt);

    // Get Base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your Delight Consumer Products account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3A6B4C; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best Regards,</p>
        <p><strong>The Delight Team</strong></p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset - Delight Consumer Products',
      html: emailHtml
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
