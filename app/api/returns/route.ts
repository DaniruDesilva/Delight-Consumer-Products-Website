import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { getReturnRequestUserTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
  const session = await getUserSession();
  
  try {
    const { order_number, identifier, reason, details, image_url } = await request.json();

    // Verify order exists and was delivered
    const order = db.getOrderForTracking(order_number, identifier);
    if (!order) {
      return NextResponse.json({ error: 'Order not found. Please check your order number and email/phone.' }, { status: 404 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Return requests can only be made for delivered orders.' }, { status: 400 });
    }

    // Verify 7-day window
    const deliveredAt = new Date(order.delivered_at);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return NextResponse.json({ error: 'Return period has expired. Returns must be requested within 7 days of delivery.' }, { status: 400 });
    }

    db.createReturnRequest({
      order_id: order.id,
      user_id: order.user_id,
      order_number,
      reason,
      details,
      image_url
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: order.customer_email,
        subject: `Return Request Received: ${order_number}`,
        html: getReturnRequestUserTemplate(order_number, order.customer_name)
      });
    } catch (emailErr) {
      console.error('Return request email failed:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Return request submitted successfully.' });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json({ error: 'Failed to submit return request.' }, { status: 500 });
  }
}
