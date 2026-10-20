'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Save, Calendar, User, Store } from 'lucide-react';
import shared from '../shared.module.css';

export default function AdminRoutePlanningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reps, setReps] = useState<any[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  
  const [retailers, setRetailers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRetailers, setSelectedRetailers] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch active sales reps
    fetch('/api/admin/sales-reps')
      .then(r => r.json())
      .then(d => { 
        if (d.success) setReps(d.data.filter((rep: any) => rep.status === 'active')); 
      })
      .catch(console.error);

    // Fetch retailers
    fetch('/api/admin/retailers')
      .then(r => r.json())
      .then(d => { 
        if (d.success) setRetailers(d.data); 
      })
      .catch(console.error);
  }, []);

  // Fetch existing route for selected rep and date
  useEffect(() => {
    if (!selectedRep || !date) {
      setSelectedRetailers(new Set());
      return;
    }
    
    fetch(`/api/admin/routes?sales_rep_id=${selectedRep}&date=${date}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const existingIds = d.data.map((v: any) => v.retailer_id);
          setSelectedRetailers(new Set(existingIds));
        }
      })
      .catch(console.error);
  }, [selectedRep, date]);

  const filteredRetailers = retailers.filter(r => 
    r.shop_name.toLowerCase().includes(search.toLowerCase()) || 
    r.city.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  const toggleRetailer = (id: number) => {
    const next = new Set(selectedRetailers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRetailers(next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRep) {
      setError('Please select a Sales Rep.');
      return;
    }
    if (selectedRetailers.size === 0) {
      setError('Please select at least one retailer.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sales_rep_id: parseInt(selectedRep),
          planned_date: date,
          retailer_ids: Array.from(selectedRetailers)
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to assign route');
      
      setSuccess('Route successfully assigned to Sales Rep.');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={shared.pageContainer}>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageTitle}>Route Planning</h1>
          <p className={shared.pageSubtitle}>Assign routes to Sales Reps</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', border: '1px solid #a7f3d0' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 300px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> Route Date *
              </label>
              <input 
                required 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 300px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> Sales Rep *
              </label>
              <select 
                required
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: 'white' }}
              >
                <option value="">Select a Sales Rep</option>
                {reps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.full_name || rep.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={16} /> Select Retailers *
              </label>
              
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search shops or cities..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredRetailers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                  No retailers found matching your search.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {filteredRetailers.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => toggleRetailer(r.id)}
                      style={{ 
                        background: 'white', 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        border: selectedRetailers.has(r.id) ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '4px', 
                        border: selectedRetailers.has(r.id) ? 'none' : '1px solid #cbd5e1',
                        background: selectedRetailers.has(r.id) ? '#2563eb' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedRetailers.has(r.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.shop_name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {r.city}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'right' }}>
              {selectedRetailers.size} retailers selected
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              type="submit" 
              disabled={loading}
              className={shared.primaryBtn}
            >
              <Save size={18} />
              {loading ? 'Assigning Route...' : 'Assign Route to Rep'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
