'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin, Phone } from 'lucide-react';

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/sales/retailers')
      .then(r => r.json())
      .then(data => {
        if (data.retailers) setRetailers(data.retailers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = retailers.filter(r => 
    r.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.contact_number.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>My Retailers</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage and onboard your retail partners.</p>
        </div>
        <Link 
          href="/sales/retailers/add"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, textDecoration: 'none' }}
        >
          <Plus size={18} />
          Add Retailer
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <Search size={20} color="#64748b" />
          <input 
            type="text"
            placeholder="Search by name, city, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading retailers...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {searchTerm ? 'No retailers found matching your search.' : 'You have not onboarded any retailers yet.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(retailer => (
              <div key={retailer.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{retailer.business_name}</h3>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{retailer.owner_name}</div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 500,
                    background: retailer.status === 'active' ? '#ecfdf5' : '#fef2f2',
                    color: retailer.status === 'active' ? '#10b981' : '#ef4444'
                  }}>
                    {retailer.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                    <Phone size={16} color="#94a3b8" />
                    {retailer.contact_number}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                    <MapPin size={16} color="#94a3b8" />
                    {retailer.city}, {retailer.district}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Balance:</span>
                  <span style={{ fontWeight: 600, color: retailer.outstanding_amount > 0 ? '#ef4444' : '#10b981' }}>
                    LKR {retailer.current_balance.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
