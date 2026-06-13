'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Package, ArrowRight } from 'lucide-react';
import styles from './success.module.css';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) setOrder(data.order);
        })
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) return <div className={styles.loading}>Loading order details...</div>;

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <h2>Order Not Found</h2>
        <p>We couldn't find the order you're looking for.</p>
        <Link href="/shop" className={styles.backBtn}>Back to Shop</Link>
      </div>
    );
  }

  const isBankTransfer = order.payment_method === 'bank_transfer';

  return (
    <div className={styles.successPage}>
      <div className="container">
        <div className={styles.successHeader}>
          {isBankTransfer ? (
            <Clock size={64} className={styles.pendingIcon} />
          ) : (
            <CheckCircle size={64} className={styles.successIcon} />
          )}
          <h1>{isBankTransfer ? 'Order Received' : 'Order Placed Successfully!'}</h1>
          <p className={styles.orderNum}>Order Number: <strong>{order.order_number}</strong></p>
          {isBankTransfer && (
            <div className={styles.pendingNotice}>
              Your payment is currently <strong>Pending Verification</strong>. Our team will verify your bank slip within 24-48 hours.
            </div>
          )}
          {!isBankTransfer && (
            <p>Thank you for your purchase! We've received your order and are processing it now.</p>
          )}
        </div>

        <div className={styles.successGrid}>
          <div className={styles.detailsCol}>
            <div className={styles.card}>
              <h3>Order Details</h3>
              <div className={styles.itemsList}>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className={styles.itemRow}>
                    <span>{item.name} × {item.qty}</span>
                    <span>Rs.{ (item.price * item.qty).toFixed(2) }</span>
                  </div>
                ))}
              </div>
              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>Rs.{order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className={styles.totalRow}>
                    <span>Discount</span>
                    <span className={styles.discount}>- Rs.{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>Rs.{order.shipping.toFixed(2)}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                  <span>Total</span>
                  <span>Rs.{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoCol}>
            <div className={styles.card}>
              <h3>Shipping Information</h3>
              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Phone:</strong> {order.customer_phone}</p>
              <p><strong>Address:</strong><br/>{order.shipping_address}, {order.shipping_city}</p>
            </div>
            <div className={styles.card}>
              <h3>Payment Method</h3>
              <p>{order.payment_method === 'cod' ? 'Cash on Delivery' : 
                 order.payment_method === 'payhere' ? 'Online Payment (PayHere)' : 
                 'Bank Transfer'}</p>
              <p><strong>Status:</strong> <span className={styles.statusBadge} data-status={order.status}>{order.status}</span></p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/shop" className={styles.continueBtn}>Continue Shopping <ArrowRight size={18} /></Link>
          <Link href="/account?tab=orders" className={styles.ordersBtn}>View All Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
