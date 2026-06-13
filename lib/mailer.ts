import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASS, // Your App Password
  },
});

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
    await transporter.sendMail({
      from: `"Delight Consumer Products" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw to avoid crashing checkout/registration flows
  }
}
