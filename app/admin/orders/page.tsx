'use client';

import { useEffect, useState } from 'react';
import styles from '../shared.module.css';

interface Order {
  id: number; order_number: string; customer_name: string; customer_email: string;
  customer_phone: string; items_json: string; subtotal: number; shipping: number;
  total: number; status: string; created_at: string;
  payment_method: string; payment_slip?: string;
  shipping_address: string; shipping_city: string; shipping_zip?: string;
}

const STATUSES = ['all', 'pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    fetch(`/api/admin/orders${params}`).then(r => r.json()).then(d => setOrders(d.orders || []));
  };

  useEffect(loadOrders, [filter]);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setToast('Order updated!');
    setTimeout(() => setToast(''), 3000);
    loadOrders();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        {STATUSES.map(s => (
          <button key={s} className={filter === s ? styles.btnPrimary : styles.btnSecondary} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize', fontSize: 12 }}>
            {s}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.order_number}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.customer_email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>Rs. {order.total.toLocaleString()}</td>
                    <td>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: '#6b7280' }}>{order.payment_method}</div>
                      {order.payment_slip && <span style={{ fontSize: 10, color: '#3A6B4C', fontWeight: 800 }}>[SLIP UPLOADED]</span>}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, background: '#f9fafb', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        {STATUSES.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className={styles.btnSecondary} onClick={() => setSelectedOrder(order)} style={{ padding: '6px 12px', fontSize: 11 }}>View Details</button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={6}><div className={styles.emptyState}><h3>No orders found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className={styles.card} style={{ maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className={styles.cardHeader} style={{ justifyContent: 'space-between' }}>
              <h2>Order Details: {selectedOrder.order_number}</h2>
              <button className={styles.btnSecondary} onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
            <div className={styles.cardBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
              <div>
                <h3 style={{ fontSize: 14, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Customer Info</h3>
                <p style={{ marginBottom: 8 }}><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p style={{ marginBottom: 8 }}><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p style={{ marginBottom: 8 }}><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                
                <h3 style={{ fontSize: 14, margin: '20px 0 12px', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Shipping Address</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedOrder.shipping_address}, {selectedOrder.shipping_city} {selectedOrder.shipping_zip}</p>
                
                <h3 style={{ fontSize: 14, margin: '20px 0 12px', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Payment</h3>
                <p style={{ marginBottom: 8 }}><strong>Method:</strong> {selectedOrder.payment_method.toUpperCase()}</p>
                {selectedOrder.payment_slip ? (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ marginBottom: 8, color: '#3A6B4C', fontWeight: 700 }}>Payment Slip:</p>
                    <a href={selectedOrder.payment_slip} target="_blank" rel="noopener noreferrer">
                      <img src={selectedOrder.payment_slip} alt="Payment Slip" style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd' }} />
                    </a>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No slip uploaded</p>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 14, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Order Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {JSON.parse(selectedOrder.items_json).map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f9f9f9', paddingBottom: 4 }}>
                      <span>{item.name} × {item.qty}</span>
                      <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, borderTop: '2px solid #f3f4f6', paddingTop: 10 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal:</span> <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Shipping:</span> <span>Rs. {selectedOrder.shipping.toLocaleString()}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 10, color: '#1a1d23' }}><span>Total:</span> <span>Rs. {selectedOrder.total.toLocaleString()}</span></div>
                </div>
                
                <div style={{ marginTop: 30 }}>
                   <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8 }}>Update Status:</label>
                   <select
                     value={selectedOrder.status}
                     onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                     className={styles.input}
                     style={{ width: '100%' }}
                   >
                     {STATUSES.filter(s => s !== 'all').map(s => (
                       <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                     ))}
                   </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
