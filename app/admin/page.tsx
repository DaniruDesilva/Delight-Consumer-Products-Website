'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, Star, Users } from 'lucide-react';
import styles from './shared.module.css';

interface Stats { products: number; orders: number; revenue: number; featured: number; pending: number; users: number; }
interface Order { id: number; order_number: string; customer_name: string; total: number; status: string; created_at: string; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders?.slice(0, 5) || []));
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}><Package size={22} /></div>
          <div className={styles.statValue}>{stats?.products ?? '—'}</div>
          <div className={styles.statLabel}>Total Products</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}><ShoppingCart size={22} /></div>
          <div className={styles.statValue}>{stats?.orders ?? '—'}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}><DollarSign size={22} /></div>
          <div className={styles.statValue}>Rs. {stats?.revenue?.toLocaleString() ?? '—'}</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}><Users size={22} /></div>
          <div className={styles.statValue}>{stats?.users ?? '—'}</div>
          <div className={styles.statLabel}>Registered Users</div>
        </div>
      </div>

      {/* Quick stat badges */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
          {stats?.pending ?? 0} pending orders
        </div>
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
          {stats?.featured ?? 0} featured products
        </div>
        <a href="/admin/coupons" style={{ textDecoration: 'none', background: '#e0e7ff', color: '#3730a3', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          🏷️ Manage Promo Coupons
        </a>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Recent Orders</h2>
        </div>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>Rs. {order.total.toLocaleString()}</td>
                  <td><span className={`${styles.badge} ${styles[order.status]}`}>{order.status}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: 13 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
