'use client';

import { useEffect, useState } from 'react';
import { Store, ShoppingCart, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SalesDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/sales/me')
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const stats = [
    { label: 'My Retailers', value: data?.stats?.retailersCount || 0, icon: Store, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Orders This Month', value: data?.stats?.ordersCount || 0, icon: ShoppingCart, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Sales (LKR)', value: (data?.stats?.totalSales || 0).toLocaleString(), icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Collections (LKR)', value: (data?.stats?.totalCollections || 0).toLocaleString(), icon: Wallet, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
          Welcome back, {data?.salesRep?.full_name?.split(' ')[0] || 'Sales Rep'}!
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Here's an overview of your territory and performance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/sales/retailers/add" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', padding: '12px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}>
              <Store size={18} />
              Onboard Retailer
            </Link>
            <Link href="/sales/orders/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#10b981', padding: '12px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}>
              <ShoppingCart size={18} />
              Create Order
            </Link>
            <Link href="/sales/collections/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', color: '#f59e0b', padding: '12px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}>
              <Wallet size={18} />
              Record Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
