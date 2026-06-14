import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { apiCache } from '@/lib/cache';

const cleanEnv = (val: string | undefined) => val ? val.replace(/['"]+/g, '') : '';
const PAYHERE_MERCHANT_ID = cleanEnv(process.env.PAYHERE_MERCHANT_ID);
const PAYHERE_SECRET = cleanEnv(process.env.PAYHERE_SECRET);

export async function POST(request: Request) {
  // Allow guest checkout or logged-in checkout
  const session = await getUserSession();
  let user: any = null;
  if (session) {
    user = db.getUserById(session.id);
  }

  try {
    const {
      shipping_address,
      shipping_city,
      shipping_postal_code,
      first_name,
      last_name,
      email,
      phone,
      notes,
      payment_method,
      coupon_code,
      payment_slip,
      cart_items // Send cart items if guest, otherwise we can fetch from DB
    } = await request.json();

    let finalCartItems = [];
    if (session) {
      finalCartItems = db.getCartItems(session.id) as any[];
      if (finalCartItems.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    } else {
      // Guest checkout
      if (!cart_items || cart_items.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      // Validate guest items against DB prices
      for (const item of cart_items) {
        const dbProduct = db.getProduct(item.product_id) as any;
        if (!dbProduct) return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
        finalCartItems.push({
          product_id: item.product_id,
          name: dbProduct.name,
          price: dbProduct.price,
          quantity: item.quantity,
          stock: dbProduct.stock,
          weight: dbProduct.weight,
          weight_unit: dbProduct.weight_unit
        });
      }
    }

    // Stock validation is now handled atomically in the transaction, but we can do a pre-check
    // to fail fast before doing all the calculations.
    for (const item of finalCartItems) {
      if (item.quantity > item.stock) {
        return NextResponse.json({ error: `${item.name} only has ${item.stock} in stock`, type: 'STOCK_INSUFFICIENT', details: { product: item.name, available: item.stock } }, { status: 400 });
      }
    }

    let subtotal = finalCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;

    // Process Coupon
    if (coupon_code) {
      const coupon = db.getCouponByCode(coupon_code);
      if (coupon) {
        let valid = true;
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) valid = false;
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) valid = false;
        if (subtotal < coupon.min_spend) valid = false;
        
        if (session && valid) {
          const pastOrder = db.instance.prepare('SELECT id FROM orders WHERE user_id = ? AND coupon_code = ?').get(session.id, coupon.code);
          if (pastOrder) {
            return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
          }
        }

        if (valid) {
          if (coupon.discount_type === 'percent') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
          } else if (coupon.discount_type === 'fixed') {
            discountAmount = coupon.discount_value;
          }
          // Free shipping is handled below
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const settings = db.getSettings();
    const flatRate = parseFloat(settings.shipping_flat_rate || '400');
    const shippingAdditionalKgRate = parseFloat(settings.shipping_additional_kg_rate || '150');
    const freeThreshold = parseFloat(settings.free_shipping_threshold || '5000');

    // Calculate total weight in kg
    const totalWeightKg = finalCartItems.reduce((sum, item) => {
      let w = item.weight || 1;
      if (item.weight_unit === 'g') w = w / 1000;
      return sum + (w * item.quantity);
    }, 0);

    let baseShipping = discountedSubtotal >= freeThreshold ? 0 : flatRate;
    let additionalShipping = 0;
    if (baseShipping > 0 && totalWeightKg > 1) {
      additionalShipping = Math.max(0, Math.ceil(totalWeightKg - 1)) * shippingAdditionalKgRate;
    }
    
    let shipping = baseShipping + additionalShipping;

    // Check if free shipping coupon applied
    if (coupon_code) {
      const coupon = db.getCouponByCode(coupon_code);
      if (coupon && coupon.discount_type === 'free_shipping' && subtotal >= coupon.min_spend) {
        shipping = 0;
      }
    }

    const total = discountedSubtotal + shipping;

    const orderNumber = `DLT-${Date.now().toString(36).toUpperCase()}`;
    const itemsJson = JSON.stringify(finalCartItems.map(i => ({ name: i.name, qty: i.quantity, price: i.price, product_id: i.product_id })));

    let status = 'pending';
    if (payment_method === 'cod') status = 'processing';
    else if (payment_method === 'bank_transfer') status = 'pending';
    else if (payment_method === 'payhere') status = 'pending_payment';

    const customerName = first_name ? `${first_name} ${last_name}` : (user?.name || 'Guest');

    // Call the atomic transaction
    db.checkoutTransaction({
      items: finalCartItems,
      orderData: {
        order_number: orderNumber,
        user_id: session ? session.id : null,
        customer_name: customerName,
        customer_email: email || user?.email || '',
        customer_phone: phone || user?.phone || '',
        items_json: itemsJson,
        subtotal,
        shipping,
        total,
        shipping_address: shipping_address || user?.address || '',
        shipping_city: shipping_city || user?.city || '',
        shipping_zip: shipping_postal_code || '',
        payment_method: payment_method || 'cod',
        coupon_code: coupon_code || null,
        discount_amount: discountAmount,
        payment_slip: payment_slip || null,
        status
      },
      couponCode: coupon_code || undefined,
      userId: session ? session.id : null
    });

    // Invalidate product cache so new stock is immediately visible
    apiCache.invalidate('products');

    const customerEmail = email || user?.email || '';
    if (customerEmail) {
      try {
        const { sendEmail } = require('@/lib/mailer');
        const { getOrderConfirmationTemplate } = require('@/lib/email-templates');
        
        const itemsListHtml = finalCartItems.map(item => `
          <div style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
            <p style="margin: 0;"><strong>${item.name}</strong> x ${item.quantity}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">LKR ${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        `).join('');

        const emailHtml = getOrderConfirmationTemplate(orderNumber, customerName, total, payment_method, itemsListHtml);
        await sendEmail({ to: customerEmail, subject: `Order Confirmed: ${orderNumber}`, html: emailHtml });
      } catch (emailErr) {
        console.error('Order confirmation email failed:', emailErr);
      }
    }

    // Handle PayHere Logic
    if (payment_method === 'payhere') {
      const amountFormatted = total.toFixed(2);
      const currency = 'LKR';

      const hashedSecret = crypto.createHash('md5').update(PAYHERE_SECRET).digest('hex').toUpperCase();
      const hashStr = PAYHERE_MERCHANT_ID + orderNumber + amountFormatted + currency + hashedSecret;
      const hash = crypto.createHash('md5').update(hashStr).digest('hex').toUpperCase();

      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

      return NextResponse.json({
        success: true,
        order_number: orderNumber,
        total,
        payhere: {
          sandbox: true,
          merchant_id: PAYHERE_MERCHANT_ID,
          return_url: `${baseUrl}/checkout/success?order=${orderNumber}`,
          cancel_url: `${baseUrl}/checkout`,
          notify_url: `${baseUrl}/api/checkout/payhere-notify`,
          order_id: orderNumber,
          items: 'Delight Products Order',
          currency: currency,
          amount: amountFormatted,
          first_name: first_name || customerName.split(' ')[0],
          last_name: last_name || customerName.split(' ').slice(1).join(' '),
          email: email || user?.email || '',
          phone: phone || user?.phone || '',
          address: shipping_address || '',
          city: shipping_city || '',
          country: 'Sri Lanka',
          hash: hash
        }
      });
    }

    return NextResponse.json({ success: true, order_number: orderNumber, total, payment_method });
  } catch (err: any) {
    console.error('Checkout error:', err);
    if (err.type === 'STOCK_INSUFFICIENT') {
      return NextResponse.json({ error: `${err.product} only has ${err.available} in stock`, type: 'STOCK_INSUFFICIENT', details: { product: err.product, available: err.available } }, { status: 400 });
    }
    return NextResponse.json({ error: 'Checkout failed: ' + err.message }, { status: 500 });
  }
}
