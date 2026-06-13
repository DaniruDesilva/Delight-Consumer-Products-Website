'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import styles from '../../shared.module.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  status: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Article | null>(null);

  useEffect(() => {
    fetch('/api/admin/news')
      .then(r => r.json())
      .then(data => {
        const found = data.articles?.find((a: Article) => a.id === parseInt(id as string));
        if (found) {
          setFormData(found);
        } else {
          router.push('/admin/news');
        }
        setLoading(false);
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/admin/news');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/news');
    }
  };

  if (loading || !formData) return <div style={{ padding: '40px' }}>Loading article...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/news" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Edit Article</h1>
            <p>Update your published story</p>
          </div>
        </div>
        <button onClick={handleDelete} className={styles.btnDanger}>
          <Trash2 size={18} /> Delete Article
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Article Title</label>
              <input 
                type="text" 
                required 
                className={styles.input} 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Slug (URL Path)</label>
              <input 
                type="text" 
                required 
                className={styles.input} 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Published Status</label>
              <select 
                className={styles.filterSelect} 
                style={{ width: '100%', margin: 0 }}
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active (Published)</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Featured Image URL</label>
              <input 
                type="text" 
                className={styles.input} 
                value={formData.image_url} 
                onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Excerpt (Short Summary)</label>
              <textarea 
                className={styles.textarea} 
                rows={3} 
                value={formData.excerpt} 
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Article Content</label>
              <textarea 
                required 
                className={styles.textarea} 
                rows={12} 
                value={formData.content} 
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/news" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
