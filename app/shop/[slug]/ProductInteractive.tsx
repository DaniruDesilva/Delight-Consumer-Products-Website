'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, Star, Check, MessageCircle, Send } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './product.module.css';

interface Product {
  id: number; slug: string; name: string; description: string; short_description: string;
  long_description: string; key_features: string; price: number;
  original_price: number | null; image: string; category: string;
  stock: number; is_featured: number; is_sale: number; min_order_quantity: number;
  weight: number | null; weight_unit: string | null;
}
interface ProductImage { id: number; image_url: string; sort_order: number; }
interface Review { id: number; user_name: string; rating: number; comment: string; created_at: string; }
interface Question { id: number; user_name: string; question: string; answer: string; answered_at: string | null; created_at: string; }

interface Props {
  product: Product;
  initialImages: ProductImage[];
}

export default function ProductInteractive({ product, initialImages }: Props) {
  const { addToCart, user } = useCart();
  const [galleryImages] = useState<ProductImage[]>(initialImages);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'qa'>('details');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [questionForm, setQuestionForm] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState('');

  const loadReviews = useCallback(() => {
    fetch(`/api/products/${product.id}/reviews`).then(r => r.json()).then(d => {
      setReviews(d.reviews || []);
      if (d.rating) setRating(d.rating);
    });
  }, [product.id]);

  const loadQuestions = useCallback(() => {
    fetch(`/api/products/${product.id}/questions`).then(r => r.json()).then(d => setQuestions(d.questions || []));
  }, [product.id]);

  useEffect(() => {
    // Fetch related products and review/Q&A data client-side
    fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=4`)
      .then(r => r.json())
      .then(d => setRelated((d.products || []).filter((rp: Product) => rp.id !== product.id).slice(0, 4)));
    loadReviews();
    loadQuestions();
  }, [product.id, product.category, loadReviews, loadQuestions]);

  useEffect(() => {
    if (!user || !product) return;
    fetch('/api/wishlist').then(r => r.json()).then(d => {
      setWishlisted((d.items || []).some((item: { product_id: number }) => item.product_id === product.id));
    });
  }, [user, product]);

  const allImages: string[] = [product.image];
  galleryImages.forEach(img => { if (img.image_url !== product.image) allImages.push(img.image_url); });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const requireAuth = (redirect: string) => {
    if (!user) { setAuthRedirect(redirect); setAuthOpen(true); return true; }
    return false;
  };

  const handleAddToCart = async () => {
    const ok = await addToCart(product.id, quantity);
    if (ok) { setAdded(true); setTimeout(() => setAdded(false), 2000); }
  };

  const handleBuyNow = async () => {
    const ok = await addToCart(product.id, quantity);
    if (ok) {
      if (!user) {
        setAuthRedirect('/checkout');
        setAuthOpen(true);
      } else {
        window.location.href = '/checkout';
      }
    }
  };

  const handleWishlist = async () => {
    if (requireAuth('')) return;
    const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) });
    if (res.ok) { const d = await res.json(); setWishlisted(d.added); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth('')) return;
    const res = await fetch(`/api/products/${product.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewForm) });
    if (res.ok) { loadReviews(); setReviewForm({ rating: 5, comment: '' }); }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth('')) return;
    if (!questionForm.trim()) return;
    const res = await fetch(`/api/products/${product.id}/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: questionForm }) });
    if (res.ok) { loadQuestions(); setQuestionForm(''); }
  };

  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
  const keyFeatures = product.key_features ? product.key_features.split('\n').filter(f => f.trim()) : [];

  return (
    <div className={styles.productPage}>
      <div className={`container ${styles.breadcrumb}`}>
        <Link href="/shop"><ArrowLeft size={16} /> Back to Shop</Link>
        <span> / {product.category} / {product.name}</span>
      </div>

      {/* ═══ Product Hero ═══ */}
      <section className={`container ${styles.productDetail}`}>
        <div className={styles.productGrid}>
          {/* Image Gallery */}
          <div className={styles.imageCol}>
            <div className={styles.mainImage} onMouseEnter={() => setIsZooming(true)} onMouseLeave={() => setIsZooming(false)} onMouseMove={handleMouseMove}>
              <Image
                src={allImages[selectedImage] || product.image}
                alt={product.name}
                fill
                style={{
                  objectFit: 'contain',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(2)' : 'scale(1)',
                  transition: isZooming ? 'none' : 'transform 0.3s ease',
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.is_sale === 1 && <span className={styles.saleBadge}>-{discount}%</span>}
            </div>
            {allImages.length > 1 && (
              <div className={styles.thumbnails}>
                {allImages.map((img, i) => (
                  <button key={i} className={`${styles.thumb} ${selectedImage === i ? styles.thumbActive : ''}`} onClick={() => setSelectedImage(i)}>
                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.infoCol}>
            <span className={styles.category}>{product.category}</span>
            <h1>{product.name}</h1>

            <div className={styles.ratingDisplay}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} fill={i <= Math.round(rating.average) ? '#f59e0b' : 'none'} color={i <= Math.round(rating.average) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className={styles.ratingText}>{rating.average > 0 ? rating.average.toFixed(1) : 'No ratings'} ({rating.count} reviews)</span>
            </div>

            <div className={styles.pricing}>
              <span className={styles.currentPrice}>Rs. {product.price.toLocaleString()}</span>
              {product.original_price && <span className={styles.originalPrice}>Rs. {product.original_price.toLocaleString()}</span>}
              {discount > 0 && <span className={styles.discountBadge}>Save {discount}%</span>}
            </div>

            <p className={styles.shortDesc}>
              {product.short_description || product.description || 'Premium quality product from Delight Consumer Products.'}
            </p>

            <div className={styles.stockInfo}>
              {product.stock > 0 ? (
                <span className={styles.inStock}><Check size={16} /> In Stock ({product.stock} available)</span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
            </div>

            <div className={styles.quantityRow}>
              <div className={styles.quantityPicker}>
                <button onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={16} /></button>
              </div>
              <button className={`${styles.addToCartBtn} ${added ? styles.addedBtn : ''}`} onClick={handleAddToCart} disabled={product.stock === 0}>
                {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`} onClick={handleWishlist}>
                <Heart size={20} fill={wishlisted ? '#dc2626' : 'none'} />
              </button>
            </div>

            <button className={styles.buyNowBtn} onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</button>

            <div className={styles.meta}>
              <div><strong>Category:</strong> {product.category}</div>
              <div><strong>SKU:</strong> DLT-{String(product.id).padStart(4, '0')}</div>
              <div><strong>Shipping:</strong> Free on orders over Rs. 1,500</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Tabs Section ═══ */}
      <section className={`container ${styles.tabsSection}`}>
        <div className={styles.tabBar}>
          <button className={`${styles.tabBtn} ${activeTab === 'details' ? styles.tabActive : ''}`} onClick={() => setActiveTab('details')}>Product Details</button>
          <button className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabActive : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({rating.count})</button>
          <button className={`${styles.tabBtn} ${activeTab === 'qa' ? styles.tabActive : ''}`} onClick={() => setActiveTab('qa')}>Q&A ({questions.length})</button>
        </div>

        {activeTab === 'details' && (
          <div className={styles.tabContent}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailText}>
                <h3>About this Product</h3>
                <p>{product.long_description || product.description || 'Premium quality product from Delight Consumer Products. Crafted with care using natural ingredients for the finest aromatic experience.'}</p>
                {keyFeatures.length > 0 && (
                  <>
                    <h3>Key Features</h3>
                    <ul className={styles.featureList}>{keyFeatures.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}
                {keyFeatures.length === 0 && (
                  <>
                    <h3>Key Features</h3>
                    <ul className={styles.featureList}>
                      <li>100% Natural &amp; High-Quality Ingredients</li>
                      <li>Long-lasting Fragrance</li>
                      <li>Eco-Friendly Packaging</li>
                      <li>Made in Sri Lanka with Love</li>
                    </ul>
                  </>
                )}
              </div>
              <div className={styles.detailSpecs}>
                <h3>Specifications</h3>
                <table className={styles.specTable}>
                  <tbody>
                    <tr><td>Brand</td><td>Delight</td></tr>
                    <tr><td>Category</td><td>{product.category}</td></tr>
                    <tr><td>SKU</td><td>DLT-{String(product.id).padStart(4, '0')}</td></tr>
                    <tr><td>Weight</td><td>{product.weight ? `${product.weight} ${product.weight_unit || 'kg'}` : 'Varies by product'}</td></tr>
                    <tr><td>Origin</td><td>Sri Lanka</td></tr>
                    <tr><td>Availability</td><td>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.tabContent}>
            <div className={styles.reviewsLayout}>
              <div className={styles.reviewSummary}>
                <div className={styles.bigRating}>
                  <span className={styles.bigNum}>{rating.average > 0 ? rating.average.toFixed(1) : '—'}</span>
                  <div className={styles.bigStars}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={20} fill={i <= Math.round(rating.average) ? '#f59e0b' : 'none'} color={i <= Math.round(rating.average) ? '#f59e0b' : '#d1d5db'} />)}
                  </div>
                  <span>{rating.count} reviews</span>
                </div>
                {user ? (
                  <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                    <h4>Write a Review</h4>
                    <div className={styles.starSelect}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} type="button" onClick={() => setReviewForm({...reviewForm, rating: i})}>
                          <Star size={24} fill={i <= reviewForm.rating ? '#f59e0b' : 'none'} color={i <= reviewForm.rating ? '#f59e0b' : '#d1d5db'} />
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Share your experience..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} />
                    <button type="submit" className={styles.submitReviewBtn}>Submit Review</button>
                  </form>
                ) : (
                  <div className={styles.loginPrompt}>
                    <p>Sign in to write a review</p>
                    <button onClick={() => { setAuthRedirect(''); setAuthOpen(true); }}>Sign In</button>
                  </div>
                )}
              </div>
              <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                  <div className={styles.emptyReviews}><Star size={32} strokeWidth={1} color="#d1d5db" /><p>No reviews yet. Be the first!</p></div>
                ) : reviews.map(review => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewAvatar}>{review.user_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <strong>{review.user_name}</strong>
                        <span>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className={styles.reviewStars}>
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= review.rating ? '#f59e0b' : 'none'} color={i <= review.rating ? '#f59e0b' : '#d1d5db'} />)}
                      </div>
                    </div>
                    {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className={styles.tabContent}>
            {user ? (
              <form onSubmit={handleSubmitQuestion} className={styles.qaForm}>
                <MessageCircle size={20} />
                <input placeholder="Ask a question about this product..." value={questionForm} onChange={e => setQuestionForm(e.target.value)} />
                <button type="submit"><Send size={18} /></button>
              </form>
            ) : (
              <div className={styles.loginPromptInline}>
                <span>Sign in to ask a question</span>
                <button onClick={() => { setAuthRedirect(''); setAuthOpen(true); }}>Sign In</button>
              </div>
            )}
            <div className={styles.qaList}>
              {questions.length === 0 ? (
                <div className={styles.emptyReviews}><MessageCircle size={32} strokeWidth={1} color="#d1d5db" /><p>No questions yet. Be the first to ask!</p></div>
              ) : questions.map(q => (
                <div key={q.id} className={styles.qaCard}>
                  <div className={styles.qaQuestion}>
                    <span className={styles.qaLabel}>Q</span>
                    <div><p>{q.question}</p><span className={styles.qaAuthor}>{q.user_name} · {new Date(q.created_at).toLocaleDateString()}</span></div>
                  </div>
                  {q.answer && (
                    <div className={styles.qaAnswer}>
                      <span className={styles.qaLabelA}>A</span>
                      <div><p>{q.answer}</p><span className={styles.qaAuthor}>Delight Team · {q.answered_at ? new Date(q.answered_at).toLocaleDateString() : ''}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══ Related Products ═══ */}
      {related.length > 0 && (
        <section className={`container ${styles.relatedSection}`}>
          <h2>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {related.map((rp, i) => (
              <ScrollReveal key={rp.id} delay={i * 0.1}>
                <Link href={`/shop/${rp.slug || rp.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage}><Image src={rp.image} alt={rp.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 25vw" /></div>
                  <div className={styles.relatedInfo}><h3>{rp.name}</h3><p>Rs. {rp.price.toLocaleString()}</p></div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} redirectTo={authRedirect || undefined} />
    </div>
  );
}
