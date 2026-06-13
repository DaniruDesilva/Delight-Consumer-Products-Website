import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const settings = db.getSettings();
    const adminEmail = settings.contact_email || process.env.SMTP_USER || 'admin@delight.lk';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #3A6B4C; margin: 10px 0;">
          ${message.replace(/\n/g, '<br/>')}
        </blockquote>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${subject || 'New Message'}`,
      html: emailHtml
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
