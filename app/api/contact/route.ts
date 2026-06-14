import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { db } from '@/lib/db';
import { getContactAdminAlertTemplate, getContactUserAutoResponderTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const settings = db.getSettings();
    const adminEmail = settings.contact_email || process.env.SMTP_USER || 'admin@delight.lk';

    // 1. Send Admin Alert
    try {
      await sendEmail({
        to: adminEmail,
        subject: `Contact Form: ${subject || 'New Message'}`,
        html: getContactAdminAlertTemplate(name, email, subject, message)
      });
    } catch (emailErr) {
      console.error('Admin alert email failed:', emailErr);
    }

    // 2. Send User Auto-Responder
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message - Delight Consumer Products',
        html: getContactUserAutoResponderTemplate(name)
      });
    } catch (emailErr) {
      console.error('Contact auto-responder email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
