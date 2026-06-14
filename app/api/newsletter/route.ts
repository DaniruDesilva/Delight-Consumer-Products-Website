import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';
import { getNewsletterWelcomeTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    db.addSubscriber(email.toLowerCase().trim());

    // Send Welcome Email
    try {
      await sendEmail({
        to: email.toLowerCase().trim(),
        subject: 'Welcome to Delight Consumer Products',
        html: getNewsletterWelcomeTemplate(),
      });
    } catch (emailErr) {
      console.error('Newsletter welcome email failed:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
