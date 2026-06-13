'use client';
import { useEffect, useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import styles from '../shared.module.css';

interface Subscriber {
  id: number; email: string; subscribed_at: string; is_active: number;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState('');

  const load = () => fetch('/api/admin/newsletter').then(r => r.json()).then(d => {
    setSubscribers(d.subscribers || []);
    setCount(d.count || 0);
  });
  
  useEffect(() => { load(); }, []);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subscriber?')) return;
    await fetch('/api/admin/newsletter', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load(); showToast('Deleted!');
  };

  const exportCsv = () => {
    const csv = ['Email,Subscribed At,Status'];
    subscribers.forEach(s => csv.push(`${s.email},${new Date(s.subscribed_at).toLocaleString()},${s.is_active ? 'Active' : 'Unsubscribed'}`));
    const blob = new Blob([csv.join('\\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div><h1>Newsletter Subscribers</h1><p>Manage community members ({count} active)</p></div>
        <button className={styles.btnPrimary} onClick={exportCsv} disabled={subscribers.length === 0}><Download size={18} /> Export CSV</button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          {subscribers.length === 0 && <div className={styles.emptyState}><h3>No subscribers yet</h3></div>}
          {subscribers.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: 13 }}>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Subscribed On</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 14 }}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.is_active ? '#dcfce7' : '#f3f4f6', color: s.is_active ? '#166534' : '#6b7280' }}>
                          {s.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
