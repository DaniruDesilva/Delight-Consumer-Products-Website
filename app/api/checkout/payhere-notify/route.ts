import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const cleanEnv = (val: string | undefined) => val ? val.replace(/['"]+/g, '') : '';
const PAYHERE_SECRET = cleanEnv(process.env.PAYHERE_SECRET);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const merchantId = formData.get('merchant_id');
    const orderId = formData.get('order_id') as string;
    const paymentId = formData.get('payment_id');
    const payhereAmount = formData.get('payhere_amount');
    const payhereCurrency = formData.get('payhere_currency');
    const statusCode = formData.get('status_code');
    const md5sig = formData.get('md5sig');

    // Verify Hash
    const hashedSecret = crypto.createHash('md5').update(PAYHERE_SECRET).digest('hex').toUpperCase();
    const hashStr = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
    const expectedHash = crypto.createHash('md5').update(hashStr).digest('hex').toUpperCase();

    if (md5sig === expectedHash) {
      if (statusCode === '2') {
        // Payment Success
        db.updateOrderStatusByNumber(orderId, 'processing');
        console.log(`Payment successful for order ${orderId}`);
      } else if (statusCode === '0') {
        // Pending
        db.updateOrderStatusByNumber(orderId, 'pending_payment');
      } else if (statusCode === '-1') {
        // Cancelled
        db.updateOrderStatusByNumber(orderId, 'cancelled');
      } else if (statusCode === '-2') {
        // Failed
        db.updateOrderStatusByNumber(orderId, 'failed');
      }
    } else {
      console.error('PayHere hash mismatch', { received: md5sig, expected: expectedHash });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('PayHere notify error:', err);
    return new Response('Error', { status: 500 });
  }
}
