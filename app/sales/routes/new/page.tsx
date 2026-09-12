'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PlanRoutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRetailers, setSelectedRetailers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/sales/retailers')
      .then(r => r.json())
      .then(d => { if (d.retailers) setRetailers(d.retailers); });
  }, []);

  const filteredRetailers = retailers.filter(r => 
    r.shop_name.toLowerCase().includes(search.toLowerCase()) || 
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRetailer = (id: number) => {
    const next = new Set(selectedRetailers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRetailers(next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedRetailers.size === 0) {
      setError('Please select at least one retailer to visit.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sales/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planned_date: date,
          retailer_ids: Array.from(selectedRetailers)
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to plan route');
      
      router.push('/sales/routes');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/sales/routes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'white', color: '#64748b', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Plan Route</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Select retailers to visit on a specific date.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Route Date *</label>
            <input 
              required 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', maxWidth: '300px' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Select Retailers ({selectedRetailers.size} selected) *</label>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search retailers by name or city..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredRetailers.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No retailers found.</div>
              ) : (
                filteredRetailers.map(r => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedRetailers.has(r.id) ? '#f8fafc' : 'white' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRetailers.has(r.id)} 
                      onChange={() => toggleRetailer(r.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{r.shop_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <MapPin size={12} /> {r.city} - {r.territory}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={loading || selectedRetailers.size === 0}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: '#2563eb', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                fontWeight: 600, 
                fontSize: '16px',
                border: 'none',
                cursor: loading || selectedRetailers.size === 0 ? 'not-allowed' : 'pointer',
                opacity: loading || selectedRetailers.size === 0 ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Route Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
