'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from '../shared.module.css';

interface Brand {
  id: number; name: string; image: string; sort_order: number; is_active: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showBrands, setShowBrands] = useState(true);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    fetch('/api/admin/brands').then(r => r.json()).then(d => setBrands(d.brands || []));
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings?.show_brands_section !== undefined) {
        setShowBrands(d.settings.show_brands_section === '1');
      }
    });
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) setImage(data.path);
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!name || !image) return;
    await fetch('/api/admin/brands', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image }),
    });
    setName(''); setImage(''); load(); showToast('Brand added!');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand?')) return;
    await fetch('/api/admin/brands', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load(); showToast('Brand deleted!');
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div><h1>Brand Partners</h1><p>Manage brand logos displayed on the homepage carousel</p></div>
      </div>

      {/* Visibility Toggle */}
      <div className={styles.card} style={{ marginBottom: 24, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Section Visibility</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Show or hide the "Trusted Brands" section on the homepage.</p>
        </div>
        <button 
          onClick={async () => {
            const newValue = !showBrands;
            setShowBrands(newValue);
            await fetch('/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ settings: { show_brands_section: newValue ? '1' : '0' } })
            });
            showToast(`Brands section ${newValue ? 'visible' : 'hidden'}!`);
          }}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
            background: showBrands ? '#ef4444' : '#10b981', color: 'white',
            transition: 'all 0.2s'
          }}
        >
          {showBrands ? 'Hide Section' : 'Show Section'}
        </button>
      </div>

      {/* Add New Brand */}
      <div className={styles.card} style={{ marginBottom: 24 }}>
        <div className={styles.cardHeader}><h2>Add New Brand</h2></div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Brand Name</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Swiss Cole" />
            </div>
            <div className={styles.formGroup}>
              <label>Brand Logo</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {image && <div style={{ width: 80, height: 50, borderRadius: 8, overflow: 'hidden', position: 'relative', border: '1px solid #e5e7eb', flexShrink: 0 }}><Image src={image} alt="Preview" fill style={{ objectFit: 'contain' }} sizes="80px" /></div>}
                <input className={styles.input} value={image} onChange={e => setImage(e.target.value)} placeholder="/path/to/logo.png" style={{ flex: 1 }} />
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <input type="file" accept="image/*" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  <button className={styles.btnSecondary} disabled={uploading} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {uploading ? <Loader2 className={styles.spin} size={16} /> : <Upload size={16} />} Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={handleAdd} disabled={!name || !image} style={{ marginTop: 16 }}>
            <Plus size={18} /> Add Brand
          </button>
        </div>
      </div>

      {/* Brands List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}><h2>Current Brands ({brands.length})</h2></div>
        <div className={styles.cardBody}>
          {brands.length === 0 && <div className={styles.emptyState}><h3>No brands yet</h3><p>Add brand logos to display on the homepage</p></div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {brands.map(brand => (
              <div key={brand.id} style={{ padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '100%', height: 60, position: 'relative', marginBottom: 12 }}>
                  <Image src={brand.image} alt={brand.name} fill style={{ objectFit: 'contain' }} sizes="200px" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{brand.name}</p>
                <button onClick={() => handleDelete(brand.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, display: 'flex', gap: 4, alignItems: 'center', margin: '0 auto' }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
