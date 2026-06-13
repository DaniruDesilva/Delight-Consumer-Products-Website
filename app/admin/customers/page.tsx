'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import styles from '../shared.module.css';

interface Customer {
  id: number; name: string; email: string; phone: string; created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => setCustomers(d.customers || []));
  }, []);

  const filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    : customers;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Customers</h1>
          <p>{customers.length} registered users</p>
        </div>
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
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5}>
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
    </div>
  );
}
