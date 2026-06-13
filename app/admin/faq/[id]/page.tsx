'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import styles from '../../shared.module.css';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FAQ | null>(null);

  const categories = ['General', 'Shipping', 'Products', 'Returns', 'Payments'];

  useEffect(() => {
    fetch('/api/admin/faqs')
      .then(r => r.json())
      .then(data => {
        const found = data.faqs?.find((f: FAQ) => f.id === parseInt(id as string));
        if (found) {
          setFormData(found);
        } else {
          router.push('/admin/faq');
        }
        setLoading(false);
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) router.push('/admin/faq');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this question?')) return;
    const res = await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/faq');
  };

  if (loading || !formData) return <div style={{ padding: '40px' }}>Loading question...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/faq" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Edit FAQ</h1>
            <p>Update question and categorize</p>
          </div>
        </div>
        <button onClick={handleDelete} className={styles.btnDanger}>
          <Trash2 size={18} /> Delete Question
        </button>
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
                value={formData.question || ''} 
                onChange={e => setFormData({ ...formData, question: e.target.value })}
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
                  {!categories.includes(formData.category) && <option value={formData.category}>{formData.category}</option>}
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
                value={formData.answer || ''} 
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/faq" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
