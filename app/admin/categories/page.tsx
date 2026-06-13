'use client';

import { useEffect, useState } from 'react';
import { Upload, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import styles from '../shared.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories || []);
        setCategoryImages(d.category_images || {});
      });
  }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setSaving(true);
    const res = await fetch('/api/admin/categories', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCat.trim() })
    });
    const d = await res.json();
    if (res.ok) {
      setCategories(d.categories);
      setNewCat('');
      showToast('Category added!');
    } else {
      showToast(d.error || 'Failed to add', 'error');
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!confirm(`Are you sure you want to delete "${cat}"?`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/categories?category=${encodeURIComponent(cat)}`, { method: 'DELETE' });
    const d = await res.json();
    if (res.ok) {
      setCategories(d.categories);
      showToast('Category deleted!');
    } else {
      showToast(d.error || 'Failed to delete', 'error');
    }
    setSaving(false);
  };

  const handleFileUpload = async (cat: string, file: File) => {
    setUploading(cat);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Save to category
        const updateRes = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat, image_url: data.path })
        });
        
        if (updateRes.ok) {
          setCategoryImages(prev => ({ ...prev, [cat]: data.path }));
          showToast(`Image updated for ${cat}`);
        } else {
          showToast('Failed to save category image', 'error');
        }
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showToast('Upload failed', 'error');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Product Categories</h1>
          <p>Manage categories and their cover images</p>
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: 24 }}>
        <div className={styles.cardBody}>
          <div style={{ display: 'flex', gap: 10, maxWidth: 500 }}>
            <input 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              placeholder="e.g. Incense Sticks" 
              className={styles.input} 
              style={{ flex: 1 }} 
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()} 
            />
            <button className={styles.btnPrimary} onClick={handleAddCategory} disabled={saving || !newCat.trim()}>Add Category</button>
          </div>
        </div>
      </div>

      <div className={styles.formGrid}>
        {categories.map(cat => (
          <div key={cat} className={styles.card}>
            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{cat}</h3>
              <button 
                onClick={() => handleDeleteCategory(cat)} 
                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: 4 }} 
                title="Delete Category"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className={styles.cardBody} style={{ paddingTop: 16 }}>
              <div style={{ width: '100%', height: '160px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16 }}>
                {categoryImages[cat] ? (
                  <img src={categoryImages[cat]} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: 8 }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: 12 }}>Auto-assigned from product</span>
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  onChange={e => e.target.files?.[0] && handleFileUpload(cat, e.target.files[0])}
                />
                <button className={styles.btnSecondary} style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }} disabled={uploading === cat}>
                  {uploading === cat ? <Loader2 className={styles.spin} size={16} /> : <Upload size={16} />}
                  {uploading === cat ? 'Uploading...' : 'Set Cover Image'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
            <div className={styles.emptyState}>
              <h3>No categories found</h3>
              <p>Add a category above to get started</p>
            </div>
          </div>
        )}
      </div>

      {toast.msg && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}
    </div>
  );
}
