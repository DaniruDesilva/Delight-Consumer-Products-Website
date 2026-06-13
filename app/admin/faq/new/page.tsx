'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import styles from '../../shared.module.css';

export default function NewFAQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    sort_order: 0
  });

  const categories = ['General', 'Shipping', 'Products', 'Returns', 'Payments'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) router.push('/admin/faq');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/faq" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>New FAQ</h1>
            <p>Add a new question and answer to the public page</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Question</label>
              <input 
                type="text" 
                required 
                className={styles.input} 
                value={formData.question} 
                onChange={e => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is your return policy?"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select 
                  className={styles.filterSelect} 
                  style={{ width: '100%', margin: 0 }}
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Or type new..." 
                  onChange={e => e.target.value && setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input 
                type="number" 
                className={styles.input} 
                value={formData.sort_order} 
                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Answer</label>
              <textarea 
                required 
                className={styles.textarea} 
                rows={8} 
                value={formData.answer} 
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Write the answer here..."
              />
            </div>
          </div>
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/faq" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
}
