'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Filter, SearchX, CheckCircle } from 'lucide-react';
import styles from './shop.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: number; name: string; price: number; image: string; category: string; stock: number; original_price: number | null; is_sale: number; slug: string;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const catQuery = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(catQuery || 'all');
  const [loading, setLoading] = useState(true);
  const { addToCart, user } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (searchQuery) params.set('search', searchQuery);
    
    // Simulate slight network delay for smooth skeleton loader presentation
    const timer = setTimeout(() => {
      fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
        setProducts(d.products || []);
        if (d.categories && categories.length === 0) {
          setCategories(d.categories.map((c: { category: string }) => c.category));
        }
        setLoading(false);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart(productId, 1);
    if (ok) { setAddedId(productId); setTimeout(() => setAddedId(null), 1500); }
  };

  const heroTitle = searchQuery 
    ? `Search Results for "${searchQuery}"`
    : activeCategory !== 'all' 
      ? `${activeCategory} Collection`
      : 'Explore Our Collection';

  const heroSubtitle = searchQuery
    ? `Showing all products matching your search query.`
    : 'Discover our premium range of aromatic solutions carefully crafted to elevate your home and lifestyle.';

  return (
    <div className={styles.shopPage}>
      {/* ─── CINEMATIC HERO ─── */}
      <header className={styles.shopHero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
        </div>
      </header>

      <div className="container">
        <div className={styles.shopLayout}>
          {/* ─── SIDEBAR FILTERS ─── */}
          <aside className={styles.sidebar}>
            <div className={styles.filterBox}>
              <div className={styles.filterHeader}>
                <Filter size={18} color="#3A6B4C" />
                <h3>Categories</h3>
              </div>
              <ul className={styles.catList}>
                <li className={activeCategory === 'all' ? styles.catActive : ''} onClick={() => setActiveCategory('all')}>
                  All Products
                  {activeCategory === 'all' && <CheckCircle size={14} />}
                </li>
                {categories.map(c => (
                  <li key={c} className={activeCategory === c ? styles.catActive : ''} onClick={() => setActiveCategory(c)}>
                    {c}
                    {activeCategory === c && <CheckCircle size={14} />}
                  </li>
                ))}
              </ul>
              <div className={styles.mobileCategorySelectWrap}>
                <select 
                  className={styles.mobileCategorySelect} 
                  value={activeCategory} 
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="all">All Products</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className={styles.selectChevron}>
                  <Filter size={16} />
                </div>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <div className={styles.mainContent}>
            
            <div className={styles.mainHeader}>
              <div className={styles.resultCount}>
                {!loading && (
                  <>Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}</>
                )}
              </div>
            </div>

            {loading ? (
              /* ─── SKELETON LOADERS ─── */
              <div className={styles.grid}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={`skel-${i}`} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonInfo}>
                      <div className={`${styles.skeletonLine} ${styles.tiny}`}></div>
                      <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                      <div className={styles.skeletonLine}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* ─── EMPTY STATE ─── */
              <div className={styles.emptyState}>
                <SearchX size={64} />
                <h3>No Products Found</h3>
                <p>We couldn't find anything matching your current filters or search terms.</p>
                <button 
                  className={styles.clearBtn} 
                  onClick={() => { setActiveCategory('all'); window.location.href='/shop'; }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* ─── PRODUCT GRID ─── */
              <div className={styles.grid}>
                {products.map((product, index) => (
                  <ScrollReveal key={product.id} delay={index * 0.08}>
                    <Link href={`/shop/${product.slug || product.id}`} className={styles.productCard}>
                      <div className={styles.productImage}>
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          fill 
                          style={{ objectFit: 'contain', padding: '20px' }} 
                          sizes="(max-width: 992px) 100vw, 33vw" 
                          {...(index < 6 ? { priority: true } : { loading: 'lazy' })} 
                        />
                        {product.is_sale === 1 && <span className={styles.saleBadge}>SALE</span>}
                        
                        {/* Desktop Hover Quick Add */}
                        <div className={styles.quickAddWrap}>
                          <button 
                            className={`${styles.addToCartBtn} ${addedId === product.id ? styles.addedWait : ''}`} 
                            onClick={(e) => handleAddToCart(e, product.id)}
                          >
                            {addedId === product.id ? 'Item Added!' : <><ShoppingCart size={16} /> Quick Add</>}
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.productInfo}>
                        <span className={styles.category}>{product.category}</span>
                        <h3>{product.name}</h3>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>Rs. {product.price.toLocaleString()}</span>
                          {product.original_price && <span className={styles.oldPrice}>Rs. {product.original_price.toLocaleString()}</span>}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div style={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
