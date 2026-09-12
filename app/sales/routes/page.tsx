'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Clock, CheckCircle, Plus, Calendar as CalendarIcon, Store, Phone, X, RefreshCw } from 'lucide-react';

export default function RoutesDashboard() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchVisits = () => {
    setLoading(true);
    fetch(`/api/sales/routes?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if (data.visits) setVisits(data.visits);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVisits();
  }, [date]);

  const handleStatusChange = async (visitId: number, currentStatus: string) => {
    setActionLoading(visitId);
    let newStatus = 'planned';
    let payload: any = { status: 'planned' };

    if (currentStatus === 'planned') {
      // Check in
      newStatus = 'in_progress';
      payload = { status: newStatus, check_in_time: new Date().toISOString() };
    } else if (currentStatus === 'in_progress') {
      // Check out
      newStatus = 'completed';
      payload = { status: newStatus, check_out_time: new Date().toISOString() };
    }

    try {
      const res = await fetch(`/api/sales/routes/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchVisits();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (visitId: number) => {
    if (!confirm('Are you sure you want to remove this visit from your route?')) return;
    
    setActionLoading(visitId);
    try {
      const res = await fetch(`/api/sales/routes/${visitId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setVisits(prev => prev.filter(v => v.id !== visitId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Routes & Visits</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Plan your day and track retailer visits.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '8px 16px', border: '1px solid #cbd5e1' }}>
            <CalendarIcon size={18} color="#64748b" style={{ marginRight: '8px' }} />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', color: '#0f172a', fontWeight: 500 }}
            />
          </div>
          <Link href="/sales/routes/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            <Plus size={18} />
            Plan Route
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading route data...</div>
      ) : visits.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#94a3b8' }}>
            <MapPin size={32} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>No visits planned</h2>
          <p style={{ color: '#64748b', margin: '0 0 24px 0', maxWidth: '400px', marginInline: 'auto' }}>
            You have no retailer visits planned for this date. Plan your route to stay organized and maximize your daily sales.
          </p>
          <Link href="/sales/routes/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
            Plan a Route
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {visits.map(visit => (
            <div key={visit.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '16px', flex: '1 1 300px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: visit.status === 'completed' ? '#ecfdf5' : visit.status === 'in_progress' ? '#eff6ff' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: visit.status === 'completed' ? '#10b981' : visit.status === 'in_progress' ? '#2563eb' : '#94a3b8' }}>
                  {visit.status === 'completed' ? <CheckCircle size={24} /> : visit.status === 'in_progress' ? <RefreshCw size={24} /> : <Store size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>{visit.shop_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {visit.address}, {visit.city}
                    </span>
                    {visit.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {visit.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {visit.status === 'planned' && (
                  <button 
                    onClick={() => handleStatusChange(visit.id, visit.status)}
                    disabled={actionLoading === visit.id}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 600, cursor: actionLoading === visit.id ? 'not-allowed' : 'pointer' }}
                  >
                    Check In
                  </button>
                )}
                
                {visit.status === 'in_progress' && (
                  <button 
                    onClick={() => handleStatusChange(visit.id, visit.status)}
                    disabled={actionLoading === visit.id}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', border: 'none', fontWeight: 600, cursor: actionLoading === visit.id ? 'not-allowed' : 'pointer' }}
                  >
                    Check Out (Complete)
                  </button>
                )}
                
                {visit.status === 'completed' && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: '#f8fafc', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Completed
                  </div>
                )}

                {visit.status === 'planned' && (
                  <button 
                    onClick={() => handleDelete(visit.id)}
                    disabled={actionLoading === visit.id}
                    style={{ padding: '8px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Remove from Route"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
