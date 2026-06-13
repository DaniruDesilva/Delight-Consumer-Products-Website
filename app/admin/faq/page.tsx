'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, HelpCircle } from 'lucide-react';
import styles from '../shared.module.css';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const loadFaqs = () => {
    fetch('/api/admin/faqs')
      .then(r => r.json())
      .then(data => {
        setFaqs(data.faqs || []);
        setCategories(data.categories?.map((c: any) => c.category) || []);
      });
  };

  useEffect(() => { loadFaqs(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return;
    const res = await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setToast('Question deleted');
      setTimeout(() => setToast(''), 3000);
      loadFaqs();
    }
  };

  const filtered = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || f.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>FAQ Manager</h1>
          <p>Organize and update frequently asked questions</p>
        </div>
        <Link href="/admin/faq/new" className={styles.btnPrimary}>
          <Plus size={18} /> New Question
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className={styles.searchInput} placeholder="Search FAQs..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(faq => (
                <tr key={faq.id}>
                  <td><span className={styles.categoryBadge}>{faq.category}</span></td>
                  <td style={{ fontWeight: 600, maxWidth: 300 }}>{faq.question}</td>
                  <td style={{ color: '#6b7280', maxWidth: 400, fontSize: 13 }} className={styles.excerptText}>
                    {faq.answer.length > 100 ? faq.answer.substring(0, 100) + '...' : faq.answer}
                  </td>
                  <td>{faq.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/admin/faq/${faq.id}`} className={styles.btnSecondary} style={{ padding: '6px 12px' }}>
                        <Pencil size={14} />
                      </Link>
                      <button className={styles.btnDanger} onClick={() => handleDelete(faq.id)} style={{ padding: '6px 12px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <HelpCircle size={48} color="#e5e7eb" style={{ marginBottom: 16 }} />
                      <h3>No items found</h3>
                      <p>Try refining your search or add a new question.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
