'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import styles from './confirmation.module.css';

function ConfirmationContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') || '';
  const total = params.get('total') || '0';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <CheckCircle size={64} color="#3A6B4C" strokeWidth={1.5} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>Thank you for your purchase</p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Order Number</span>
            <strong>{orderNumber}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Total Paid</span>
            <strong>Rs. {Number(total).toLocaleString()}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Method</span>
            <strong>Cash on Delivery</strong>
          </div>
        </div>

        <p className={styles.info}>We&apos;ll send you an email confirmation shortly. You can track your order from your account.</p>

        <div className={styles.actions}>
          <Link href="/account" className={styles.ordersBtn}>View My Orders</Link>
          <Link href="/shop" className={styles.shopBtn}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
