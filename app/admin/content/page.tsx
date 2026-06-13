'use client';

import { useEffect, useState } from 'react';
import { Save, Upload, ImageIcon, Loader2 } from 'lucide-react';
import styles from '../shared.module.css';

interface ContentItem {
  id: number; page: string; section: string; content_key: string;
  content_value: string; content_type: string;
}

const PAGES = ['home', 'about', 'contact', 'terms', 'privacy', 'legal', 'careers'];

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [activePage, setActivePage] = useState('home');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`/api/admin/content?page=${activePage}`).then(r => r.json()).then(d => setContent(d.content || []));
  }, [activePage]);

  const updateValue = (id: number, value: string) => {
    setContent(content.map(c => c.id === id ? { ...c, content_value: value } : c));
  };

  const handleFileUpload = async (id: number, file: File) => {
    setUploading(id);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateValue(id, data.path);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: content }),
    });
    setToast('Content saved!');
    setTimeout(() => setToast(''), 3000);
    setSaving(false);
  };


  // Group content by section
  const sections: Record<string, ContentItem[]> = {};
  content.forEach(c => {
    // Hide 'hero' section on 'home' page since it's managed via Hero Slides
    if (activePage === 'home' && c.section === 'hero') return;

    if (!sections[c.section]) sections[c.section] = [];
    sections[c.section].push(c);
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Content Manager</h1>
          <p>Edit your website text and images</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className={styles.toolbar}>
        {PAGES.map(page => (
          <button
            key={page}
            className={activePage === page ? styles.btnPrimary : styles.btnSecondary}
            onClick={() => setActivePage(page)}
            style={{ textTransform: 'capitalize' }}
          >
            {page}
          </button>
        ))}
      </div>

      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className={styles.card} style={{ marginBottom: 20 }}>
          <div className={styles.cardHeader}>
            <h2 style={{ textTransform: 'capitalize' }}>{section} Section</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              {items.map(item => (
                <div key={item.id} className={`${styles.formGroup} ${item.content_type === 'text' && item.content_value.length > 80 ? styles.full : ''}`}>
                  <label style={{ textTransform: 'capitalize' }}>{item.content_key.replace(/_/g, ' ')}</label>
                  {item.content_type === 'image' ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '100px', height: '100px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                        {item.content_value ? (
                          <img src={item.content_value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          value={item.content_value} 
                          onChange={e => updateValue(item.id, e.target.value)} 
                          placeholder="/path/to/image.png" 
                          className={styles.input}
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="file" 
                            accept="image/*"
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            onChange={e => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                          />
                          <button className={styles.btnSecondary} style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }} disabled={uploading === item.id}>
                            {uploading === item.id ? <Loader2 className={styles.spin} size={18} /> : <Upload size={18} />}
                            {uploading === item.id ? 'Uploading...' : 'Upload New Image'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : item.content_value.length > 80 || item.content_key.includes('text') ? (
                    <textarea value={item.content_value} onChange={e => updateValue(item.id, e.target.value)} rows={4} className={styles.input} />
                  ) : (
                    <input value={item.content_value} onChange={e => updateValue(item.id, e.target.value)} className={styles.input} />
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {content.length === 0 && (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <h3>No content found</h3>
            <p>No editable content for this page yet</p>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
