'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import shared from '../shared.module.css';
import styles from '../admin.module.css';

const PERMISSIONS = [
  { id: 'manage_products', label: 'Manage Products (Products, Brands, Info)' },
  { id: 'manage_orders', label: 'Manage Orders (Orders, Returns, Coupons)' },
  { id: 'manage_content', label: 'Manage Content (Content, News, Slides, Media, FAQs)' },
  { id: 'manage_careers', label: 'Manage Careers (Jobs, Applications)' },
  { id: 'manage_customers', label: 'Manage Customers (Customers, Newsletter, Questions)' },
  { id: 'manage_settings', label: 'Manage Settings' }
];

export default function AdminStaffPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<any>(null);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    admin_role: 'admin',
    permissions: [] as string[]
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.status === 401) {
        window.location.href = '/admin'; // Redirect if not super_admin
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin?: any) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        username: admin.username,
        email: admin.email || '',
        password: '',
        admin_role: admin.admin_role || 'admin',
        permissions: (admin.permissions && admin.permissions !== 'undefined') ? JSON.parse(admin.permissions || '[]') : []
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        admin_role: 'admin',
        permissions: []
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
      const url = editingAdmin ? `/api/admin/staff/${editingAdmin.id}` : '/api/admin/staff';
      const method = editingAdmin ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (editingAdmin && !payload.password) {
        delete payload.password; // Don't update password if empty
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (admin: any) => {
    setDeleteConfirmAdmin(admin);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmAdmin) return;
    const id = deleteConfirmAdmin.id;
    setDeleteConfirmAdmin(null);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (admin: any) => {
    try {
      const res = await fetch(`/api/admin/staff/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: admin.is_active === 0 ? true : false })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => {
      const has = prev.permissions.includes(permId);
      if (has) return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      return { ...prev, permissions: [...prev.permissions, permId] };
    });
  };

  if (loading) return <div className={shared.loading}>Loading...</div>;

  return (
    <div className={shared.pageContainer}>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageTitle}>Staff Management</h1>
          <p className={shared.pageSubtitle}>Manage admin accounts and their roles/permissions</p>
        </div>
        <button className={shared.primaryBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Admin
        </button>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: 0 }}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Permissions Count</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => {
                let permCount = 0;
                try { permCount = JSON.parse(admin.permissions || '[]').length; } catch {}
                
                return (
                  <tr key={admin.id}>
                    <td style={{ fontWeight: 600 }}>{admin.username}</td>
                    <td>{admin.email || '-'}</td>
                    <td>
                      <span className={`${shared.badge} ${admin.admin_role === 'super_admin' ? shared.active : shared.processing}`}>
                        {admin.admin_role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span className={`${shared.badge} ${admin.is_active === 0 ? shared.cancelled : shared.active}`}>
                        {admin.is_active === 0 ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td>{admin.admin_role === 'super_admin' ? 'All' : permCount}</td>
                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={shared.actionButtons}>
                        <button className={`${shared.iconBtn} ${shared.editBtn}`} onClick={() => handleOpenModal(admin)} title="Edit">
                          <Edit size={16} />
                        </button>
                        
                        <button 
                          className={`${shared.iconBtn} ${admin.is_active === 0 ? shared.activeBtn : shared.cancelledBtn}`} 
                          onClick={() => admin.admin_role !== 'super_admin' && handleToggleActive(admin)} 
                          title={admin.admin_role === 'super_admin' ? "Cannot disable super admin" : (admin.is_active === 0 ? "Enable Admin" : "Disable Admin")}
                          disabled={admin.admin_role === 'super_admin'}
                          style={{ 
                            background: admin.admin_role === 'super_admin' ? '#f3f4f6' : (admin.is_active === 0 ? '#d1fae5' : '#fef2f2'), 
                            color: admin.admin_role === 'super_admin' ? '#d1d5db' : (admin.is_active === 0 ? '#065f46' : '#991b1b'),
                            cursor: admin.admin_role === 'super_admin' ? 'not-allowed' : 'pointer',
                            opacity: admin.admin_role === 'super_admin' ? 0.5 : 1
                          }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'currentColor' }} />
                        </button>
                        
                        <button 
                          className={`${shared.iconBtn} ${shared.deleteBtn}`} 
                          onClick={() => admin.admin_role !== 'super_admin' && handleDeleteClick(admin)} 
                          title={admin.admin_role === 'super_admin' ? "Cannot delete super admin" : "Delete"}
                          disabled={admin.admin_role === 'super_admin'}
                          style={{
                            cursor: admin.admin_role === 'super_admin' ? 'not-allowed' : 'pointer',
                            opacity: admin.admin_role === 'super_admin' ? 0.5 : 1,
                            background: admin.admin_role === 'super_admin' ? '#f3f4f6' : undefined,
                            color: admin.admin_role === 'super_admin' ? '#d1d5db' : undefined
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className={shared.emptyState}>No staff found.</td>
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
              <h2>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button className={shared.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={shared.modalBody}>
              {error && <div className={shared.errorMessage}>{error}</div>}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                    className={shared.input}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={shared.input}
                    required
                    pattern="^\S+@\S+\.\S+$"
                    title="Please enter a valid email address (e.g., admin@delight.com)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={shared.formGroup}>
                  <label>Password {editingAdmin && '(Leave blank to keep unchanged)'}</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editingAdmin}
                    className={shared.input}
                    pattern={(!editingAdmin || formData.password) ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}" : undefined}
                    title={(!editingAdmin || formData.password) ? "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character." : undefined}
                  />
                </div>
                <div className={shared.formGroup}>
                  <label>Role</label>
                  <select
                    value={formData.admin_role}
                    onChange={e => setFormData({...formData, admin_role: e.target.value})}
                    className={shared.input}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {formData.admin_role !== 'super_admin' && (
                <div className={shared.formGroup} style={{ marginBottom: '20px' }}>
                  <label style={{ marginBottom: '10px', display: 'block' }}>Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {PERMISSIONS.map(perm => (
                      <label key={perm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{perm.label}</span>
                        <button
                          type="button"
                          className={`${shared.toggle} ${formData.permissions.includes(perm.id) ? shared.active : ''}`}
                          onClick={() => togglePermission(perm.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className={shared.modalFooter}>
                <button type="button" className={shared.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={shared.primaryBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmAdmin && (
        <div className={shared.modalOverlay} onClick={() => setDeleteConfirmAdmin(null)}>
          <div className={shared.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={shared.modalHeader}>
              <h2 style={{ color: '#dc2626' }}>Delete Admin</h2>
              <button className={shared.closeBtn} onClick={() => setDeleteConfirmAdmin(null)}>×</button>
            </div>
            <div className={shared.modalBody}>
              <p style={{ margin: '0 0 20px', color: '#4b5563', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{deleteConfirmAdmin.username}</strong>? This action cannot be undone.
              </p>
              <div className={shared.modalFooter}>
                <button className={shared.btnSecondary} onClick={() => setDeleteConfirmAdmin(null)}>Cancel</button>
                <button className={shared.primaryBtn} style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={confirmDelete}>
                  Yes, Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
