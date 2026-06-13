'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import styles from './track.module.css';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderNumber}?id=${identifier}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found. Please check your details.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.trackPage}>
      <div className="container">
        <div className={styles.trackHero}>
          <h1>Track Your Order</h1>
          <p>Enter your order number and email/phone to see the latest status of your aromatic treasures.</p>
        </div>

        <div className={styles.trackCard}>
          <form onSubmit={handleTrack} className={styles.trackForm}>
            <div className={styles.inputGroup}>
              <label>Order Number</label>
              <input 
                type="text" 
                placeholder="e.g. DLT-ABC123" 
                value={orderNumber} 
                onChange={e => setOrderNumber(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Email or Phone Number</label>
              <input 
                type="text" 
                placeholder="Used during checkout" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className={styles.trackBtn} disabled={loading}>
              {loading ? 'Searching...' : <><Search size={18} /> Track Order</>}
            </button>
          </form>

          {error && <div className={styles.error}>{error}</div>}

          {order && (
            <div className={styles.orderResult}>
              <div className={styles.statusHeader}>
                <div className={styles.statusIcon}>
                  {order.status === 'pending' && <Clock size={32} color="#f59e0b" />}
                  {order.status === 'processing' && <Package size={32} color="#3b82f6" />}
                  {order.status === 'shipped' && <Truck size={32} color="#8b5cf6" />}
                  {order.status === 'delivered' && <CheckCircle size={32} color="#10b981" />}
                </div>
                <div className={styles.statusText}>
                  <h3>Status: <span className={styles.badge} data-status={order.status}>{order.status}</span></h3>
                  <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className={styles.trackingTimeline}>
                <div className={`${styles.timelineItem} ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? styles.completed : ''}`}>
                  <div className={styles.dot}></div>
                  <div className={styles.label}>Order Placed</div>
                </div>
                <div className={`${styles.timelineItem} ${['processing', 'shipped', 'delivered'].includes(order.status) ? styles.completed : ''}`}>
                  <div className={styles.dot}></div>
                  <div className={styles.label}>Processing</div>
                </div>
                <div className={`${styles.timelineItem} ${['shipped', 'delivered'].includes(order.status) ? styles.completed : ''}`}>
                  <div className={styles.dot}></div>
                  <div className={styles.label}>Shipped</div>
                </div>
                <div className={`${styles.timelineItem} ${['delivered'].includes(order.status) ? styles.completed : ''}`}>
                  <div className={styles.dot}></div>
                  <div className={styles.label}>Delivered</div>
                </div>
              </div>

              <div className={styles.orderBrief}>
                <div className={styles.briefCol}>
                  <strong>Ships to:</strong>
                  <p>{order.customer_name}<br/>{order.shipping_address}, {order.shipping_city}</p>
                </div>
                <div className={styles.briefCol}>
                  <strong>Items:</strong>
                  <p>{order.items.length} items (Total: Rs.{order.total.toFixed(2)})</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
