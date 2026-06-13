'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import styles from '../../shared.module.css';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '/hero_luxury.png',
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/admin/news');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/news" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Create Article</h1>
            <p>Publish a new brand story or update</p>
          </div>
        </div>
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
                onChange={onTitleChange}
                placeholder="e.g., A Legacy of Fragrance Established in 2025" 
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
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.image_url} 
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Excerpt (Short Summary)</label>
              <textarea 
                className={styles.textarea} 
                rows={3} 
                value={formData.excerpt} 
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief summary that appears on the news grid..."
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
                placeholder="Write your article content here (supports plain text and line breaks)..."
              />
            </div>
          </div>
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/news" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
