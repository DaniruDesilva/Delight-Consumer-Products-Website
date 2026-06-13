'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Calendar, Newspaper } from 'lucide-react';
import styles from '../shared.module.css';

interface Article {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  status: string;
  published_at: string;
}

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [toast, setToast] = useState('');

  const loadArticles = () => {
    fetch('/api/admin/news')
      .then(r => r.json())
      .then(data => setArticles(data.articles || []));
  };

  useEffect(() => { loadArticles(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setToast('Article deleted successfully');
      setTimeout(() => setToast(''), 3000);
      loadArticles();
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>News & Articles</h1>
          <p>Manage your company updates and brand stories</p>
        </div>
        <Link href="/admin/news/new" className={styles.btnPrimary}>
          <Plus size={18} /> New Article
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Date Published</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td>
                    <div style={{ width: 64, height: 40, borderRadius: 6, overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                      <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} sizes="64px" />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1d23' }}>{article.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>/{article.slug}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                      <Calendar size={14} color="#9ca3af" />
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${article.status === 'active' ? styles.active : styles.pending}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/admin/news/${article.id}`} className={styles.btnSecondary} style={{ padding: '6px 12px' }}>
                        <Pencil size={14} />
                      </Link>
                      <button className={styles.btnDanger} onClick={() => handleDelete(article.id)} style={{ padding: '6px 12px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <Newspaper size={48} color="#e5e7eb" style={{ marginBottom: 16 }} />
                      <h3>No articles found</h3>
                      <p>Start sharing your brand story by creating your first article.</p>
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
