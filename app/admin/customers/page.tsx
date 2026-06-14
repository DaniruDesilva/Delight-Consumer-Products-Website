'use client';

import { useEffect, useState } from 'react';
import { Search, Users, Plus, Trash2 } from 'lucide-react';
import styles from '../shared.module.css';

interface Customer {
  id: number; name: string; email: string; phone: string; created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = () => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => setCustomers(d.customers || []));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeleteConfirmCustomer(customer);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmCustomer) return;
    const id = deleteConfirmCustomer.id;
    setDeleteConfirmCustomer(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    : customers;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSubtitle}>{customers.length} registered users</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleOpenModal}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className={styles.toolbar}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className={styles.searchInput} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>#{customer.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3A6B4C, #5a9b6e)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '—'}</td>
                  <td style={{ color: '#9ca3af', fontSize: 13 }}>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.iconBtn} ${styles.deleteBtn}`} 
                        onClick={() => handleDeleteClick(customer)} 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className={styles.emptyState}>
                    <Users size={32} strokeWidth={1} />
                    <h3>No customers found</h3>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => !saving && setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Add New Customer</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.formGroup}>
                <label>Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone (Optional)</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmCustomer && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmCustomer(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc2626' }}>Delete Customer</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteConfirmCustomer(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 20px', color: '#4b5563', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{deleteConfirmCustomer.name}</strong>? This action cannot be undone and will delete their cart items and wishlist.
              </p>
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={() => setDeleteConfirmCustomer(null)}>Cancel</button>
                <button className={styles.primaryBtn} style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={confirmDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
