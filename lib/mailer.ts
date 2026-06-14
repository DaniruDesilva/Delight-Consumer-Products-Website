import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\n--- EMAIL SKIPPED (SMTP credentials not configured) ---');
    console.warn(`To: ${to}\nSubject: ${subject}\nBody: ${html.substring(0, 100)}...`);
    console.warn('-----------------------------------------------------\n');
    return;
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Delight Consumer Products" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to} (ID: ${info.messageId})`);
  } catch (error) {
    console.error('Error sending email to', to, ':', error);
    throw error; // Re-throw so callers know it failed
  }
}
