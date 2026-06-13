import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setUserSessionCookie } from '@/lib/auth';

import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Name, email, phone, and password are required' }, { status: 400 });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Mobile number must start with 0 and be exactly 10 digits' }, { status: 400 });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }, { status: 400 });
    }
    const existingUser = db.getUserByEmail(email);
    const existingAdminByEmail = db.instance.prepare('SELECT id FROM admins WHERE email = ?').get(email);
    if (existingUser || existingAdminByEmail) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    const existingAdminByName = db.getAdminByUsername(name);
    if (existingAdminByName) {
      return NextResponse.json({ error: 'This name is restricted because it is used by a staff member. Please choose a different name.' }, { status: 409 });
    }
    const password_hash = await hashPassword(password);
    const result = db.createUser({ name, email, phone: phone || '', password_hash });
    const userId = Number(result.lastInsertRowid);
    const token = await createToken({ id: userId, email, role: 'user' });
    await setUserSessionCookie(token);

    // Send Welcome Email
    await sendEmail({
      to: email,
      subject: 'Welcome to Delight Consumer Products',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Delight, ${name}!</h2>
          <p>Thank you for creating an account with us. We're thrilled to have you here.</p>
          <p>You can now explore our premium range of aromatic products, track your orders, and enjoy faster checkout.</p>
          <br/>
          <p>Best Regards,</p>
          <p><strong>The Delight Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, user: { id: userId, name, email } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
