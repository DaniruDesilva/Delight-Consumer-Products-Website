'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/sales/orders')
      .then(r => r.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.retailer_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 500,
                        background: order.status === 'completed' || order.status === 'delivered' ? '#ecfdf5' : order.status === 'pending_approval' ? '#fefce8' : order.status === 'rejected' ? '#fef2f2' : '#eff6ff',
                        color: order.status === 'completed' || order.status === 'delivered' ? '#10b981' : order.status === 'pending_approval' ? '#ca8a04' : order.status === 'rejected' ? '#ef4444' : '#2563eb'
                      }}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
