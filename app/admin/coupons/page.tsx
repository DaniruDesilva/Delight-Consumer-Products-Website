'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import shared from '../shared.module.css';
import { Trash2, Plus, Power, PowerOff } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_spend: '',
    usage_limit: '',
    expiry_date: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: number) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 })
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...newCoupon,
      discount_value: parseFloat(newCoupon.discount_value),
      min_spend: newCoupon.min_spend ? parseFloat(newCoupon.min_spend) : 0,
      usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
      expiry_date: newCoupon.expiry_date || null
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', min_spend: '', usage_limit: '', expiry_date: '' });
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={shared.loading}>Loading coupons...</div>;

  return (
    <div className={shared.pageContainer}>
      <div className={shared.pageHeader}>
        <div>
          <h1>Coupons</h1>
          <p>Manage discount codes and promotions</p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={20} /> Create Coupon
        </button>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: 0 }}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Spend</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td><strong>{coupon.code}</strong></td>
                  <td>
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` :
                      coupon.discount_type === 'fixed' ? `Rs. ${coupon.discount_value}` : 'Free Shipping'}
                  </td>
                  <td>Rs. {coupon.min_spend}</td>
                  <td>{coupon.usage_count} / {coupon.usage_limit || '∞'}</td>
                  <td>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <span className={`${shared.badge} ${coupon.is_active ? shared.active : shared.draft}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={`${shared.toggle} ${coupon.is_active ? shared.active : ''}`}
                      onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                      title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    />
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className={shared.emptyState}>No coupons found. Create one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={shared.modalOverlay}>
          <div className={shared.modal}>
            <div className={shared.modalHeader}>
              <h2>Create New Coupon</h2>
              <button className={shared.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreate} className={shared.modalBody}>
              {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

              <div className={shared.formGroup}>
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className={shared.formGroup}>
                  <label>Discount Type *</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div className={shared.formGroup}>
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    required={newCoupon.discount_type !== 'free_shipping'}
                    min="0"
                    step="0.01"
                    placeholder={newCoupon.discount_type === 'percent' ? "e.g. 10" : "e.g. 500"}
                    value={newCoupon.discount_value}
                    onChange={e => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className={shared.formGroup}>
                  <label>Minimum Spend (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newCoupon.min_spend}
                    onChange={e => setNewCoupon({ ...newCoupon, min_spend: e.target.value })}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave blank for unlimited"
                    value={newCoupon.usage_limit}
                    onChange={e => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                  />
                </div>
              </div>

              <div className={shared.formGroup}>
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expiry_date}
                  onChange={e => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                />
              </div>

              <div className={shared.modalFooter}>
                <button type="button" className={shared.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={shared.btnPrimary} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
