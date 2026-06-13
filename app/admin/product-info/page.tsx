'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2, Edit3 } from 'lucide-react';
import Image from 'next/image';
import styles from '../shared.module.css';

interface InfoCard {
  id: number; title: string; subtitle: string; description: string;
  image: string; slug: string; detail_content: string; detail_image: string;
  sort_order: number; is_active: number;
}

export default function ProductInfoPage() {
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [editing, setEditing] = useState<InfoCard | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => fetch('/api/admin/product-info').then(r => r.json()).then(d => setCards(d.cards || []));
  useEffect(() => { load(); }, []);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleUpload = async (file: File, cb: (p: string) => void) => {
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
    await fetch('/api/admin/product-info', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setEditing(null); load();
    showToast(editing.id ? 'Card updated!' : 'Card created!');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this card?')) return;
    await fetch('/api/admin/product-info', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load(); showToast('Deleted!');
  };

  const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const blank = (): InfoCard => ({ id: 0, title: '', subtitle: '', description: '', image: '', slug: '', detail_content: '', detail_image: '', sort_order: cards.length, is_active: 1 });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div><h1>Product Info Cards</h1><p>Manage the &quot;Learn More&quot; section</p></div>
        <button className={styles.btnPrimary} onClick={() => setEditing(blank())}><Plus size={18} /> Add Card</button>
      </div>

      <div className={styles.card}><div className={styles.cardBody}>
        {cards.length === 0 && <div className={styles.emptyState}><h3>No cards</h3></div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {cards.map(c => (
            <div key={c.id} style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: 130, position: 'relative' }}>
                {c.image && <Image src={c.image} alt={c.title} fill style={{ objectFit: 'cover' }} sizes="300px" />}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>/{c.slug}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.btnSecondary} onClick={() => setEditing(c)} style={{ flex: 1, padding: '6px 12px', display: 'flex', gap: 4, justifyContent: 'center' }}><Edit3 size={14} /> Edit</button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', borderRadius: 8, padding: '6px 12px' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div></div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 20 }}>{editing.id ? 'Edit Card' : 'New Card'}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input className={styles.input} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : genSlug(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label>Slug</label>
                <input className={styles.input} value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Subtitle</label>
                <input className={styles.input} value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Short Description</label>
                <textarea className={styles.input} rows={2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Card Image</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {editing.image && <div style={{ width: 100, height: 70, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #e5e7eb' }}><Image src={editing.image} alt="" fill style={{ objectFit: 'cover' }} sizes="100px" /></div>}
                  <div style={{ flex: 1 }}>
                    <input className={styles.input} value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} style={{ marginBottom: 8 }} />
                    <div style={{ position: 'relative' }}>
                      <input type="file" accept="image/*" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], p => setEditing({ ...editing, image: p }))} />
                      <button className={styles.btnSecondary} disabled={uploading} style={{ width: '100%', display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {uploading ? <Loader2 className={styles.spin} size={16} /> : <Upload size={16} />} Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Detail Page Content (HTML)</label>
                <textarea className={styles.input} rows={8} value={editing.detail_content} onChange={e => setEditing({ ...editing, detail_content: e.target.value })} placeholder="<h2>Section</h2><p>Content...</p>" />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.input} value={editing.is_active} onChange={e => setEditing({ ...editing, is_active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={!editing.title || !editing.image || !editing.slug}>Save</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
