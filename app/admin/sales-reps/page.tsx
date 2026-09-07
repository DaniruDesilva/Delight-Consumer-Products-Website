'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import shared from '../shared.module.css';

export default function AdminSalesRepsPage() {
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRep, setEditingRep] = useState<any>(null);
  const [deleteConfirmRep, setDeleteConfirmRep] = useState<any>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    territory: '',
    base_salary: 0,
    max_discount_percent: 5,
    status: 'active'
  });

  useEffect(() => {
    fetchReps();
  }, []);

  const fetchReps = async () => {
    try {
      const res = await fetch('/api/admin/sales-reps');
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setReps(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rep?: any) => {
    if (rep) {
      setEditingRep(rep);
      setFormData({
        username: rep.username || '',
        email: rep.email || '',
        password: '',
        full_name: rep.full_name || '',
        phone: rep.phone || '',
        territory: rep.territory || '',
        base_salary: rep.base_salary || 0,
        max_discount_percent: rep.max_discount_percent || 5,
        status: rep.status || 'active'
      });
    } else {
      setEditingRep(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        territory: '',
        base_salary: 0,
        max_discount_percent: 5,
        status: 'active'
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingRep ? `/api/admin/sales-reps/${editingRep.id}` : '/api/admin/sales-reps';
      const method = editingRep ? 'PUT' : 'POST';

      const payload: any = { ...formData };
      if (editingRep && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      fetchReps();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (rep: any) => {
    setDeleteConfirmRep(rep);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmRep) return;
    try {
      const res = await fetch(`/api/admin/sales-reps/${deleteConfirmRep.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchReps();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteConfirmRep(null);
    }
  };

  const handleToggleActive = async (rep: any) => {
    try {
      const newStatus = rep.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/admin/sales-reps/${rep.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchReps();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className={shared.loading}>Loading...</div>;

  return (
    <div className={shared.pageContainer}>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageTitle}>Sales Representatives</h1>
          <p className={shared.pageSubtitle}>Manage your sales team and their territories</p>
        </div>
        <button className={shared.primaryBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Sales Rep
        </button>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: 0 }}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name / Username</th>
                <th>Territory</th>
                <th>Phone</th>
                <th>Sales (M)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reps.map(rep => (
                <tr key={rep.id}>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{rep.employee_code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rep.full_name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>@{rep.username}</div>
                  </td>
                  <td>{rep.territory || '-'}</td>
                  <td>{rep.phone || '-'}</td>
                  <td>Rs. {(rep.monthlySales || 0).toLocaleString()}</td>
                  <td>
                    <span className={`${shared.badge} ${rep.status === 'active' ? shared.active : shared.cancelled}`}>
                      {rep.status}
                    </span>
                  </td>
                  <td>
                    <div className={shared.actionButtons}>
                      <button className={`${shared.iconBtn} ${shared.editBtn}`} onClick={() => handleOpenModal(rep)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        className={`${shared.iconBtn} ${rep.status === 'inactive' ? shared.activeBtn : shared.cancelledBtn}`} 
                        onClick={() => handleToggleActive(rep)} 
                        title={rep.status === 'inactive' ? "Enable Rep" : "Disable Rep"}
                        style={{ 
                          background: rep.status === 'inactive' ? '#d1fae5' : '#fef2f2', 
                          color: rep.status === 'inactive' ? '#065f46' : '#991b1b',
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'currentColor' }} />
                      </button>
                      <button 
                        className={`${shared.iconBtn} ${shared.deleteBtn}`} 
                        onClick={() => handleDeleteClick(rep)} 
                        title="Deactivate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reps.length === 0 && (
                <tr>
                  <td colSpan={7} className={shared.emptyState}>No sales representatives found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={shared.modalOverlay} onClick={() => !saving && setShowModal(false)}>
          <div className={shared.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={shared.modalHeader}>
              <h2>{editingRep ? 'Edit Sales Rep' : 'Add New Sales Rep'}</h2>
              <button className={shared.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={shared.modalBody}>
              {error && <div className={shared.errorMessage}>{error}</div>}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    required
                    className={shared.input}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className={shared.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Username (Login ID)</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                    className={shared.input}
                    disabled={!!editingRep}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={shared.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Password {editingRep && '(Leave blank to keep unchanged)'}</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editingRep}
                    className={shared.input}
                    pattern={(!editingRep || formData.password) ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}" : undefined}
                    title={(!editingRep || formData.password) ? "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character." : undefined}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Territory</label>
                  <input 
                    type="text" 
                    value={formData.territory}
                    onChange={e => setFormData({...formData, territory: e.target.value})}
                    className={shared.input}
                    placeholder="e.g. Colombo North"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Base Salary (Rs.)</label>
                  <input 
                    type="number" 
                    value={formData.base_salary}
                    onChange={e => setFormData({...formData, base_salary: Number(e.target.value)})}
                    className={shared.input}
                    min="0"
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Max Discount %</label>
                  <input 
                    type="number" 
                    value={formData.max_discount_percent}
                    onChange={e => setFormData({...formData, max_discount_percent: Number(e.target.value)})}
                    className={shared.input}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className={shared.modalFooter}>
                <button type="button" className={shared.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={shared.primaryBtn} disabled={saving}>
                  {saving ? 'Saving...' : (editingRep ? 'Save Changes' : 'Add Sales Rep')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmRep && (
        <div className={shared.modalOverlay} onClick={() => setDeleteConfirmRep(null)}>
          <div className={shared.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={shared.modalHeader}>
              <h2 style={{ color: '#dc2626' }}>Deactivate Sales Rep</h2>
              <button className={shared.closeBtn} onClick={() => setDeleteConfirmRep(null)}>×</button>
            </div>
            <div className={shared.modalBody}>
              <p style={{ margin: '0 0 20px', color: '#4b5563', lineHeight: '1.5' }}>
                Are you sure you want to deactivate <strong>{deleteConfirmRep.full_name}</strong>? They will no longer be able to log in or process orders.
              </p>
              <div className={shared.modalFooter}>
                <button className={shared.btnSecondary} onClick={() => setDeleteConfirmRep(null)}>Cancel</button>
                <button className={shared.primaryBtn} style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={confirmDelete}>
                  Yes, Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
