'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X, ImagePlus } from 'lucide-react';
import styles from '../../shared.module.css';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState({
    name: '', description: '', short_description: '', long_description: '', key_features: '',
    price: '', original_price: '',
    image: '/incense.png', category: 'Incense', stock: '0',
    weight: '1', weight_unit: 'kg', min_order_quantity: '1',
    is_featured: false, is_sale: false, status: 'active',
  });
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || ['Incense', 'Perfume']));
    fetch(`/api/admin/products/${id}`, { cache: 'no-store' }).then(r => r.json()).then(p => {
      if (p.error) return;
      setForm({
        name: p.name || '', description: p.description || '',
        short_description: p.short_description || '', long_description: p.long_description || '',
        key_features: p.key_features || '',
        price: String(p.price || ''), original_price: p.original_price ? String(p.original_price) : '',
        image: p.image || '/incense.png', category: p.category || 'Incense',
        stock: String(p.stock || 0), weight: String(p.weight ?? 1), weight_unit: p.weight_unit || 'kg',
        min_order_quantity: String(p.min_order_quantity ?? 1),
        is_featured: p.is_featured === 1,
        is_sale: p.is_sale === 1, status: p.status || 'active',
      });
      // Load gallery images
      if (p.gallery_images && Array.isArray(p.gallery_images)) {
        setGalleryImages(p.gallery_images.map((img: { image_url: string } | string) =>
          typeof img === 'string' ? img : img.image_url
        ));
      }
      setLoaded(true);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.path || null;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = await uploadImage(file);
    if (path) setForm({ ...form, image: path });
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || galleryImages.length >= 5) return;
    setUploading(true);
    const path = await uploadImage(file);
    if (path) setGalleryImages([...galleryImages, path]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        weight: parseFloat(form.weight) || 1,
        weight_unit: form.weight_unit,
        min_order_quantity: parseInt(form.min_order_quantity) || 1,
        gallery_images: galleryImages,
      }),
    });
    if (res.ok) {
      setToast('Product updated!');
      setTimeout(() => setToast(''), 3000);
    }
    setSaving(false);
  };

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1>Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div className={styles.card} style={{ marginBottom: 20 }}>
              <div className={styles.cardHeader}><h2>Basic Info</h2></div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>Product Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>Short Description (shown under price)</label>
                    <input name="short_description" value={form.short_description} onChange={handleChange} placeholder="Brief one-line summary..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Price (Rs.) *</label>
                    <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Original Price (Rs.)</label>
                    <input name="original_price" type="number" step="0.01" value={form.original_price} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Stock Quantity</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Weight</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} style={{ flex: 1 }} />
                      <select name="weight_unit" value={form.weight_unit} onChange={handleChange} style={{ width: 80 }}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Minimum Order Quantity</label>
                    <input name="min_order_quantity" type="number" value={form.min_order_quantity} onChange={handleChange} min="1" placeholder="1" />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card} style={{ marginBottom: 20 }}>
              <div className={styles.cardHeader}><h2>Product Details</h2></div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>Long Description (for Product Details tab)</label>
                    <textarea name="long_description" value={form.long_description} onChange={handleChange} placeholder="Detailed product description..." rows={5} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>Key Features (one per line)</label>
                    <textarea name="key_features" value={form.key_features} onChange={handleChange} placeholder={"100% Natural Ingredients\nLong-lasting Fragrance"} rows={4} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Main Image */}
            <div className={styles.card} style={{ marginBottom: 20 }}>
              <div className={styles.cardHeader}><h2>Main Image</h2></div>
              <div className={styles.cardBody} style={{ textAlign: 'center' }}>
                <div className={styles.imagePreview} style={{ width: '100%', height: 200, marginBottom: 16 }}>
                  <Image src={form.image} alt="Preview" fill style={{ objectFit: 'contain' }} sizes="300px" />
                </div>
                <label className={styles.btnSecondary} style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Change Main Image'}
                  <input type="file" accept="image/*" onChange={handleMainImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div className={styles.card} style={{ marginBottom: 20 }}>
              <div className={styles.cardHeader}><h2>Gallery (up to 5)</h2></div>
              <div className={styles.cardBody}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: galleryImages.length < 5 ? 14 : 0 }}>
                  {galleryImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
                      <Image src={img} alt={`Gallery ${i+1}`} fill style={{ objectFit: 'cover' }} sizes="100px" />
                      <button type="button" onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {galleryImages.length < 5 && (
                  <label className={styles.btnSecondary} style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                    <ImagePlus size={16} /> Add Image ({galleryImages.length}/5)
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Options */}
            <div className={styles.card}>
              <div className={styles.cardHeader}><h2>Options</h2></div>
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Featured Product</span>
                  <button type="button" className={`${styles.toggle} ${form.is_featured ? styles.active : ''}`} onClick={() => setForm(prev => ({ ...prev, is_featured: !prev.is_featured }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>On Sale</span>
                  <button type="button" className={`${styles.toggle} ${form.is_sale ? styles.active : ''}`} onClick={() => setForm(prev => ({ ...prev, is_sale: !prev.is_sale }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <Link href="/admin/products" className={styles.btnSecondary}>Cancel</Link>
        </div>
      </form>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
