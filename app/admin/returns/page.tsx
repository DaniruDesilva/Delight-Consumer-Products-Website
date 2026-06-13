'use client';

import { useEffect, useState } from 'react';
import styles from '../shared.module.css';

interface ReturnRequest {
  id: number;
  order_number: string;
  reason: string;
  details: string;
  status: string;
  image_url?: string;
  created_at: string;
}

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [toast, setToast] = useState('');

  const loadRequests = () => {
    fetch('/api/admin/returns').then(r => r.json()).then(d => setRequests(d.requests || []));
  };

  useEffect(loadRequests, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/returns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setToast('Status updated!');
    setTimeout(() => setToast(''), 3000);
    loadRequests();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Return Requests</h1>
          <p>Manage customer return and exchange requests</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Image</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 700 }}>{req.order_number}</td>
                  <td>
                    {req.image_url ? (
                      <a href={req.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={req.image_url} alt="Return" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      </a>
                    ) : <span style={{ color: '#9ca3af', fontSize: '11px' }}>No Image</span>}
                  </td>
                  <td style={{ fontSize: 13 }}>{req.reason}</td>
                  <td style={{ fontSize: 13, maxWidth: '300px' }}>{req.details}</td>
                  <td>
                    <span className={`${styles.badge} ${req.status === 'pending' ? styles.badgeWarning : req.status === 'approved' ? styles.badgeSuccess : styles.badgeDanger}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#9ca3af' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className={styles.btnSuccess} onClick={() => updateStatus(req.id, 'approved')} style={{ padding: '4px 8px', fontSize: '11px' }}>Approve</button>
                      <button className={styles.btnDanger} onClick={() => updateStatus(req.id, 'rejected')} style={{ padding: '4px 8px', fontSize: '11px' }}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6}><div className={styles.emptyState}><h3>No return requests</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
