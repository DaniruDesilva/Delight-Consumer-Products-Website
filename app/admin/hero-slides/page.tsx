'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import styles from '../shared.module.css';

interface Slide {
  id: number; title: string; subtitle: string; label: string;
  image: string; image_mobile?: string; link_url: string; link_text: string;
  sort_order: number; is_active: number;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => fetch('/api/admin/hero-slides').then(r => r.json()).then(d => setSlides(d.slides || []));
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpload = async (file: File, cb: (path: string) => void) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) cb(data.path);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    const method = editing.id ? 'PUT' : 'POST';
    await fetch('/api/admin/hero-slides', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setEditing(null); load(); showToast(editing.id ? 'Slide updated!' : 'Slide created!');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slide?')) return;
    await fetch('/api/admin/hero-slides', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load(); showToast('Slide deleted!');
  };

  const newSlide = (): Slide => ({ id: 0, title: '', subtitle: '', label: '', image: '', image_mobile: '', link_url: '/shop', link_text: 'SHOP NOW', sort_order: slides.length, is_active: 1 });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div><h1>Hero Carousel Slides</h1><p>Manage the hero section image carousel</p></div>
        <button className={styles.btnPrimary} onClick={() => setEditing(newSlide())}><Plus size={18} /> Add Slide</button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          {slides.length === 0 && <div className={styles.emptyState}><h3>No slides yet</h3><p>Add your first hero carousel slide</p></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {slides.map(slide => (
              <div key={slide.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <GripVertical size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <div style={{ width: 120, height: 70, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {slide.image && <Image src={slide.image} alt={slide.title} fill style={{ objectFit: 'cover' }} sizes="120px" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{slide.title?.replace(/\\n/g, ' ') || 'Untitled'}</strong>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{slide.subtitle?.substring(0, 60)}...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {slide.is_active ? <Eye size={18} style={{ color: '#22c55e' }} /> : <EyeOff size={18} style={{ color: '#9ca3af' }} />}
                  <button className={styles.btnSecondary} onClick={() => setEditing(slide)} style={{ padding: '8px 16px' }}>Edit</button>
                  <button onClick={() => handleDelete(slide.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 24 }}>{editing.id ? 'Edit Slide' : 'New Slide'}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Label (e.g. CRAFTED BY NATURE)</label>
                <input className={styles.input} value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Title (use \n for line break)</label>
                <input className={styles.input} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Subtitle</label>
                <textarea className={styles.input} rows={3} value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Desktop Image (16:9 Landscape)</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {editing.image && <div style={{ width: 160, height: 90, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #e5e7eb' }}><Image src={editing.image} alt="Preview" fill style={{ objectFit: 'cover' }} sizes="160px" /></div>}
                  <div style={{ flex: 1 }}>
                    <input className={styles.input} value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="/path/to/desktop-image.png" style={{ marginBottom: 8 }} />
                    <div style={{ position: 'relative' }}>
                      <input type="file" accept="image/*" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], path => setEditing({ ...editing, image: path }))} />
                      <button className={styles.btnSecondary} style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }} disabled={uploading}>
                        {uploading ? <Loader2 className={styles.spin} size={18} /> : <Upload size={18} />} {uploading ? 'Uploading...' : 'Upload Desktop Image'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Mobile Image (Optional - Portrait)</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {editing.image_mobile && <div style={{ width: 90, height: 160, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #e5e7eb' }}><Image src={editing.image_mobile} alt="Mobile Preview" fill style={{ objectFit: 'cover' }} sizes="90px" /></div>}
                  <div style={{ flex: 1 }}>
                    <input className={styles.input} value={editing.image_mobile || ''} onChange={e => setEditing({ ...editing, image_mobile: e.target.value })} placeholder="/path/to/mobile-image.png (Optional)" style={{ marginBottom: 8 }} />
                    <div style={{ position: 'relative' }}>
                      <input type="file" accept="image/*" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], path => setEditing({ ...editing, image_mobile: path }))} />
                      <button className={styles.btnSecondary} style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }} disabled={uploading}>
                        {uploading ? <Loader2 className={styles.spin} size={18} /> : <Upload size={18} />} {uploading ? 'Uploading...' : 'Upload Mobile Image'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Button Text</label>
                <input className={styles.input} value={editing.link_text} onChange={e => setEditing({ ...editing, link_text: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Button Link</label>
                <input className={styles.input} value={editing.link_url} onChange={e => setEditing({ ...editing, link_url: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Active</label>
                <select className={styles.input} value={editing.is_active} onChange={e => setEditing({ ...editing, is_active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={!editing.image}>Save Slide</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
