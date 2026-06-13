'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import styles from '../shared.module.css';

interface Product {
  id: number; name: string; price: number; original_price: number | null;
  image: string; category: string; stock: number; is_featured: number;
  is_sale: number; status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const loadProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);
    fetch(`/api/admin/products?${params}`).then(r => r.json()).then(d => {
      setProducts(d.products || []);
      setCategories(d.categories?.map((c: { category: string }) => c.category) || []);
    });
  };

  useEffect(() => { loadProducts(); }, [search, category]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setToast('Product deleted');
    setTimeout(() => setToast(''), 3000);
    loadProducts();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new" className={styles.btnPrimary}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className={styles.searchInput} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <select className={styles.filterSelect} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1d23' }}>{product.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {product.is_featured === 1 && <span className={`${styles.badge} ${styles.active}`} style={{ fontSize: 10 }}>Featured</span>}
                      {product.is_sale === 1 && <span className={`${styles.badge} ${styles.pending}`} style={{ fontSize: 10 }}>Sale</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>Rs. {product.price.toLocaleString()}</div>
                    {product.original_price && <div style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>Rs. {product.original_price.toLocaleString()}</div>}
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <span style={{ color: product.stock < 10 ? '#dc2626' : '#374151', fontWeight: 600 }}>{product.stock}</span>
                  </td>
                  <td><span className={`${styles.badge} ${styles[product.status]}`}>{product.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/admin/products/${product.id}`} className={styles.btnSecondary} style={{ padding: '6px 12px' }}>
                        <Pencil size={14} />
                      </Link>
                      <button className={styles.btnDanger} onClick={() => handleDelete(product.id)} style={{ padding: '6px 12px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7}><div className={styles.emptyState}><h3>No products found</h3><p>Add your first product to get started</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
