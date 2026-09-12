'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: number | null; currentStatus: string; newStatus: string }>({
    isOpen: false,
    orderId: null,
    currentStatus: '',
    newStatus: ''
  });

  const loadOrders = () => {
    fetch('/api/sales/orders')
      .then(r => r.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusSelect = (id: number, currentStatus: string, newStatus: string) => {
    setConfirmModal({ isOpen: true, orderId: id, currentStatus, newStatus });
  };

  const confirmUpdateStatus = async () => {
    const { orderId, newStatus } = confirmModal;
    if (!orderId) return;

    await fetch(`/api/sales/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    
    setConfirmModal({ isOpen: false, orderId: null, currentStatus: '', newStatus: '' });
    loadOrders();
  };

  const getAvailableStatuses = (currentStatus: string) => {
    if (currentStatus === 'ready') return ['ready', 'delivered'];
    if (currentStatus === 'delivered') return ['ready', 'delivered', 'cash_collected'];
    if (currentStatus === 'cash_collected') return ['delivered', 'cash_collected'];
    return [currentStatus]; // fallback for pending, cancelled, etc where rep can't edit
  };

  const filtered = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.retailer_name && o.retailer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Sales Orders</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage your B2B orders.</p>
        </div>
        <Link 
          href="/sales/orders/new"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}
        >
          <Plus size={18} />
          Create Order
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <Search size={20} color="#64748b" />
          <input 
            type="text"
            placeholder="Search by order number or retailer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {searchTerm ? 'No orders found matching your search.' : 'You have not created any orders yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Order #</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Retailer</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Total (LKR)</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#64748b" />
                        {order.order_number}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                      {order.retailer_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {order.total.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {(() => {
                        const available = getAvailableStatuses(order.status);
                        const formatStatus = (s: string) => s.replace('_', ' ').toUpperCase();
                        
                        if (available.length > 1) {
                          return (
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
                              {available.map(s => (
                                <option key={s} value={s}>{formatStatus(s)}</option>
                              ))}
                            </select>
                          );
                        }
                        
                        return (
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: 500,
                            background: order.status === 'completed' || order.status === 'delivered' || order.status === 'cash_collected' ? '#ecfdf5' : order.status === 'pending_approval' ? '#fefce8' : order.status === 'rejected' ? '#fef2f2' : '#eff6ff',
                            color: order.status === 'completed' || order.status === 'delivered' || order.status === 'cash_collected' ? '#10b981' : order.status === 'pending_approval' ? '#ca8a04' : order.status === 'rejected' ? '#ef4444' : '#2563eb'
                          }}>
                            {formatStatus(order.status)}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Update Order Status"
        message={`Are you sure you want to change the order status to ${confirmModal.newStatus.replace('_', ' ').toUpperCase()}?`}
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
