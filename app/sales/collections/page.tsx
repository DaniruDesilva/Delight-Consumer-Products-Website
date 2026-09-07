'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Wallet } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/sales/collections')
      .then(r => r.json())
      .then(data => {
        if (data.collections) setCollections(data.collections);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = collections.filter(c => 
    c.retailer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.reference_number && c.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Collections</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage payments from your retailers.</p>
        </div>
        <Link 
          href="/sales/collections/new"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}
        >
          <Plus size={18} />
          Record Collection
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <Search size={20} color="#64748b" />
          <input 
            type="text"
            placeholder="Search by retailer name or reference number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading collections...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {searchTerm ? 'No collections found matching your search.' : 'You have not recorded any collections yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Retailer</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Amount (LKR)</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Method</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Ref / Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(collection => (
                  <tr key={collection.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                      {new Date(collection.collected_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                      {collection.retailer_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {collection.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 500,
                        background: collection.payment_method === 'cash' ? '#ecfdf5' : '#eff6ff',
                        color: collection.payment_method === 'cash' ? '#10b981' : '#2563eb'
                      }}>
                        {collection.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                      {collection.reference_number || '-'}
                      {collection.notes && <div style={{ fontSize: '12px', marginTop: '4px' }}>{collection.notes}</div>}
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
