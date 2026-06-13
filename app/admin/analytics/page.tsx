'use client';

import { useEffect, useState } from 'react';
import { Activity, Users, ShoppingBag, Clock, Eye, DollarSign, Smartphone, Monitor } from 'lucide-react';
import styles from '../shared.module.css';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Activity className={styles.spin} size={32} color="#4b5563" />
      </div>
    );
  }

  if (data?.error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>
        <h2>Error Loading Analytics</h2>
        <p>{data.error}</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalVisitors: 0,
    avgDurationSeconds: 0,
    totalPageViews: 0,
    registeredUsers: 0,
    buyingCustomers: 0,
    conversionRate: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };
  const devices = data?.devices || [];
  const salesTrend = data?.salesTrend || [];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const desktopCount = devices.find((d: any) => d.device_type === 'desktop')?.count || 0;
  const mobileCount = devices.find((d: any) => d.device_type === 'mobile')?.count || 0;
  const unknownCount = devices.find((d: any) => d.device_type === 'unknown')?.count || 0;
  const totalDevices = desktopCount + mobileCount + unknownCount || 1; // avoid /0

  const maxRevenue = Math.max(...(salesTrend.map((t: any) => t.revenue) || [0]), 1000);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Analytics & Reports</h1>
          <p>Insights into your website traffic and sales performance</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}><Users size={22} /></div>
          <div className={styles.statValue}>{metrics.totalVisitors}</div>
          <div className={styles.statLabel}>Total Visitors</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}><Clock size={22} /></div>
          <div className={styles.statValue}>{formatDuration(metrics.avgDurationSeconds)}</div>
          <div className={styles.statLabel}>Avg Time on Site</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}><Eye size={22} /></div>
          <div className={styles.statValue}>{metrics.totalPageViews}</div>
          <div className={styles.statLabel}>Total Page Views</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}><ShoppingBag size={22} /></div>
          <div className={styles.statValue}>{metrics.conversionRate}%</div>
          <div className={styles.statLabel}>Conversion Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
        {/* Funnel Metrics */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>User Funnel</h2>
          </div>
          <div className={styles.cardBody}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Total Visitors</span>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{metrics.totalVisitors}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#3b82f6' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Registered Users</span>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{metrics.registeredUsers}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (metrics.registeredUsers / Math.max(1, metrics.totalVisitors)) * 100)}%`, height: '100%', background: '#8b5cf6' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Buying Customers</span>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{metrics.buyingCustomers}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (metrics.buyingCustomers / Math.max(1, metrics.totalVisitors)) * 100)}%`, height: '100%', background: '#10b981' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Types */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Device Usage</h2>
          </div>
          <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
              <Monitor size={32} color="#4b5563" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Desktop</span>
                  <span style={{ fontSize: 14 }}>{Math.round((desktopCount / totalDevices) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(desktopCount / totalDevices) * 100}%`, height: '100%', background: '#4f46e5' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <Smartphone size={32} color="#4b5563" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Mobile</span>
                  <span style={{ fontSize: 14 }}>{Math.round((mobileCount / totalDevices) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(mobileCount / totalDevices) * 100}%`, height: '100%', background: '#f59e0b' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Sales Trend (Last 7 Days)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 600 }}>
            <DollarSign size={18} /> Rs. {metrics.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className={styles.cardBody}>
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: '2%', paddingTop: 20, borderBottom: '1px solid #e5e7eb' }}>
            {salesTrend.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: '#9ca3af', paddingBottom: 20 }}>No sales data available for this period.</div>
            ) : (
              salesTrend.map((day: any, i: number) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Rs.{day.revenue.toLocaleString()}</span>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: 40, 
                      height: `${Math.max(5, (day.revenue / maxRevenue) * 150)}px`, 
                      background: '#34d399', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} 
                    title={`Orders: ${day.orders}`}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#4b5563' }}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
