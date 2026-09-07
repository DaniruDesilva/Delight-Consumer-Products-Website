'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Calendar } from 'lucide-react';

export default function DailyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales/reports')
      .then(r => r.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Daily Reports</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Review your submitted end-of-day reports.</p>
        </div>
        <Link 
          href="/sales/reports/new"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}
        >
          <Plus size={18} />
          Submit Daily Report
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            You have not submitted any daily reports yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Territory</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Shops Visited</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Sales Total</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#64748b" />
                        {new Date(report.report_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                      {report.territory || '-'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                      {report.shops_visited} / {report.shops_planned || report.shops_visited}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {report.total_sales > 0 ? `LKR ${report.total_sales.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b', maxWidth: '300px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.market_feedback || report.problems || '-'}
                      </div>
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
