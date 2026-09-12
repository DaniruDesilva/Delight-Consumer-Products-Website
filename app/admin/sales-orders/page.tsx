'use client';

import { useEffect, useState } from 'react';
import styles from '../shared.module.css';
import ConfirmModal from '@/components/shared/ConfirmModal';

interface SalesOrder {
  id: number;
  order_number: string;
  retailer_name: string;
  rep_name: string;
  rep_code: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUSES = ['all', 'pending', 'ready', 'delivered', 'cash_collected', 'cancelled'];

export default function AdminSalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: number | null; currentStatus: string; newStatus: string }>({
    isOpen: false,
    orderId: null,
    currentStatus: '',
    newStatus: ''
  });

  const loadOrders = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    fetch(`/api/admin/sales-orders${params}`)
      .then(r => r.json())
      .then(d => setOrders(d.orders || []));
  };

  useEffect(loadOrders, [filter]);

  const handleStatusSelect = (id: number, currentStatus: string, newStatus: string) => {
    setConfirmModal({ isOpen: true, orderId: id, currentStatus, newStatus });
  };

  const confirmUpdateStatus = async () => {
    const { orderId, newStatus } = confirmModal;
    if (!orderId) return;

    await fetch(`/api/admin/sales-orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    
    setConfirmModal({ isOpen: false, orderId: null, currentStatus: '', newStatus: '' });
    setToast('Status updated!');
    setTimeout(() => setToast(''), 3000);
    loadOrders();
  };

  const getAvailableStatuses = (currentStatus: string) => {
    if (currentStatus === 'pending') return ['pending', 'ready', 'cancelled'];
    if (currentStatus === 'ready') return ['pending', 'ready', 'delivered', 'cancelled'];
    if (currentStatus === 'delivered') return ['ready', 'delivered', 'cash_collected', 'cancelled'];
    if (currentStatus === 'cash_collected') return ['delivered', 'cash_collected']; // Allow undoing cash_collected to delivered
    if (currentStatus === 'cancelled') return ['pending', 'cancelled']; 
    
    return STATUSES.filter(s => s !== 'all');
  };

  const formatStatus = (s: string) => s.replace('_', ' ').toUpperCase();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>B2B Sales Orders</h1>
          <p>Manage wholesale orders from Sales Reps</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        {STATUSES.map(s => (
          <button 
            key={s} 
            className={filter === s ? styles.btnPrimary : styles.btnSecondary} 
            onClick={() => setFilter(s)} 
            style={{ textTransform: 'capitalize', fontSize: 12 }}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {toast && (
        <div style={{ padding: '12px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '16px', border: '1px solid #a7f3d0' }}>
          {toast}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Retailer</th>
                <th>Sales Rep</th>
                <th>Total (LKR)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const availableStatuses = getAvailableStatuses(order.status);
                
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{order.retailer_name}</td>
                    <td>
                      <div>{order.rep_name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.rep_code}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{order.total.toLocaleString()}</td>
                    <td>
                      {availableStatuses.length > 1 ? (
                        <select
                          value={order.status}
                          onChange={e => handleStatusSelect(order.id, order.status, e.target.value)}
                          style={{ 
                            padding: '6px 10px', 
                            borderRadius: 8, 
                            border: '1px solid #e5e7eb', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            background: '#f9fafb', 
                            cursor: 'pointer' 
                          }}
                        >
                          {availableStatuses.map(s => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: order.status === 'cash_collected' ? '#ecfdf5' : '#f3f4f6',
                          color: order.status === 'cash_collected' ? '#059669' : '#4b5563'
                        }}>
                          {formatStatus(order.status)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Update Order Status"
        message={`Are you sure you want to change the order status to ${formatStatus(confirmModal.newStatus)}?`}
        confirmText="Yes, update status"
        cancelText="Cancel"
        onConfirm={confirmUpdateStatus}
        onCancel={() => {
          setConfirmModal({ isOpen: false, orderId: null, currentStatus: '', newStatus: '' });
          loadOrders(); // Reset dropdown visually
        }}
      />
    </div>
  );
}
