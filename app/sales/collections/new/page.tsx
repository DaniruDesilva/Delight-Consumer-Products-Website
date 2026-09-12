'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function RecordCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [retailers, setRetailers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    retailer_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    fetch('/api/sales/retailers')
      .then(r => r.json())
      .then(d => { if (d.retailers) setRetailers(d.retailers); });
  }, []);

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedRetailerData = retailers.find(r => r.id.toString() === formData.retailer_id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sales/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          retailer_id: parseInt(formData.retailer_id),
          amount: parseFloat(formData.amount)
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to record collection');
      
      router.push('/sales/collections');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/sales/collections" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'white', color: '#64748b', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Record Collection</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Log a payment received from a retailer.</p>
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
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Select Retailer *</label>
            <select required name="retailer_id" value={formData.retailer_id} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', background: 'white' }}>
              <option value="">-- Choose Retailer --</option>
              {retailers.map(r => (
                <option key={r.id} value={r.id}>{r.shop_name} ({r.city})</option>
              ))}
            </select>
            {selectedRetailerData && (
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Outstanding Balance: <strong style={{ color: selectedRetailerData.outstanding_balance > 0 ? '#ef4444' : '#10b981' }}>LKR {selectedRetailerData.outstanding_balance.toLocaleString()}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Amount Collected (LKR) *</label>
              <input required type="number" min="1" step="0.01" name="amount" value={formData.amount} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} placeholder="e.g. 5000" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Payment Method *</label>
              <select required name="payment_method" value={formData.payment_method} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', background: 'white' }}>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {formData.payment_method !== 'cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Reference Number *</label>
              <input required={formData.payment_method !== 'cash'} name="reference_number" value={formData.reference_number} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} placeholder={formData.payment_method === 'cheque' ? 'Cheque Number' : 'Transaction ID'} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Notes (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'vertical', minHeight: '80px' }} placeholder="Any additional details..." />
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {loading ? 'Processing...' : 'Record Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
