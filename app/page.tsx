'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { Truck, Headset, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import Parallax from '@/components/Parallax';
import SplitText from '@/components/SplitText';
import BentoCollections from '@/components/BentoCollections';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface PopupSettings { enabled: boolean; title: string; description: string; image: string; link: string; linkText: string; delaySeconds: number; }
interface PopupModalProps { popup: PopupSettings; onDismiss: () => void; }

// ─── Lazy-load the popup (hidden until triggered, no need in main bundle) ───
const PopupModal = dynamic<PopupModalProps>(
  () => import('@/components/PopupModal'),
  { ssr: false }
) as ComponentType<PopupModalProps>;

interface Slide { id: number; title: string; subtitle: string; label: string; image: string; image_mobile?: string; link_url: string; link_text: string; }
interface Category { name: string; image: string; }
interface InfoCard { id: number; title: string; subtitle: string; description: string; image: string; slug: string; }
interface Product { id: number; name: string; price: number; original_price: number | null; image: string; is_sale: number; slug: string; }
interface Brand { id: number; name: string; image: string; }


function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', gap: 24, overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ minWidth: 280, flexShrink: 0 }}>
          <div style={{ height: 200, background: '#F0EDE8', borderRadius: 12, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 16, background: '#F0EDE8', borderRadius: 4, width: '70%', marginBottom: 8 }} />
          <div style={{ height: 14, background: '#F0EDE8', borderRadius: 4, width: '50%' }} />
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [popup, setPopup] = useState<PopupSettings | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const t = Date.now();
    Promise.all([
      fetch(`/api/hero-slides?t=${t}`).then(r => r.ok ? r.json() : { slides: [] }).catch(() => ({ slides: [] })),
      fetch(`/api/categories?t=${t}`).then(r => r.ok ? r.json() : { categories: [] }).catch(() => ({ categories: [] })),
      fetch(`/api/product-info?t=${t}`).then(r => r.ok ? r.json() : { cards: [] }).catch(() => ({ cards: [] })),
      fetch(`/api/products?featured=1&t=${t}`).then(r => r.ok ? r.json() : { products: [] }).catch(() => ({ products: [] })),
      fetch(`/api/brands?t=${t}`).then(r => r.ok ? r.json() : { brands: [] }).catch(() => ({ brands: [] })),
      fetch(`/api/popup?t=${t}`).then(r => r.ok ? r.json() : { enabled: false }).catch(() => ({ enabled: false })),
      fetch(`/api/content?page=home&t=${t}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([slidesData, categoriesData, infoData, productsData, brandsData, popupData, contentData]) => {
      setSlides(slidesData.slides || []);
      setCategories(categoriesData.categories || []);
      setInfoCards(infoData.cards || []);
      setProducts(productsData.products || []);
      setBrands(brandsData.brands || []);
      setPopup(popupData);
      const contentMap: Record<string, string> = {};
      const data = contentData as any;
      if (data && typeof data === 'object' && !data.error) {
        for (const section in data) {
          for (const key in data[section]) {
            contentMap[`${section}_${key}`] = data[section][key];
          }
        }
      }
      setPageContent(contentMap);
      if (popupData.enabled && !localStorage.getItem('delight_popup_dismissed')) {
        setTimeout(() => setShowPopup(true), popupData.delaySeconds * 1000);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-play hero carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const dismissPopup = () => {
    setShowPopup(false);
    localStorage.setItem('delight_popup_dismissed', 'true');
  };

  // Horizontal Scroll Helper
  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const categoriesRef = useRef<HTMLDivElement>(null);
  const infoCardsRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.home}>
      {/* ─── 1. Hero Carousel with Parallax ─── */}
      <section className={styles.heroWrapper}>
        <AnimatePresence initial={false} mode="wait">
          {slides.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={styles.heroSlide}
            >
              <Parallax speed={0.4} className={styles.heroBackground}>
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  fetchPriority="high"
                  sizes="100vw"
                  className={slides[currentSlide].image_mobile ? styles.desktopOnlyImage : ''}
                />
                {slides[currentSlide].image_mobile && (
                  <Image
                    src={slides[currentSlide].image_mobile}
                    alt={slides[currentSlide].title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    className={styles.mobileOnlyImage}
                  />
                )}
                <div className={styles.heroGradient}></div>
              </Parallax>

              <div className={`container ${styles.heroContent}`}>
                {slides[currentSlide].label && slides[currentSlide].label.trim() !== '' && (
                  <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={styles.heroLabel}>
                    {slides[currentSlide].label}
                  </motion.span>
                )}
                <div style={{ marginBottom: '24px' }}>
                  <SplitText text={slides[currentSlide].title.replace(/\\n/g, ' ')} className={styles.heroTitleSplit} />
                </div>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                  {slides[currentSlide].subtitle}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className={styles.heroActions}>
                  <Link href={slides[currentSlide].link_url} className={styles.primaryAction}>{slides[currentSlide].link_text}</Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button className={`${styles.sliderArrow} ${styles.heroArrowLeft}`} onClick={prevSlide} aria-label="Previous slide"><ChevronLeft size={24} /></button>
            <button className={`${styles.sliderArrow} ${styles.heroArrowRight}`} onClick={nextSlide} aria-label="Next slide"><ChevronRight size={24} /></button>
            <div className={styles.heroDots}>
              {slides.map((_, i) => (
                <button key={i} className={`${styles.heroDot} ${i === currentSlide ? styles.heroDotActive : ''}`} onClick={() => setCurrentSlide(i)} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}

        {/* Scroll Down Indicator */}
        <div className={styles.scrollIndicator}>
          <span>SCROLL</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* ─── 2. Trust Features (Glassmorphism Cards) ─── */}
      <ScrollReveal>
        <section className={styles.trustFeatures}>
          <div className="container">
            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <div className={styles.trustIconCircle}><Truck size={26} strokeWidth={1.5} /></div>
                <div className={styles.trustText}><h3>Free Shipping</h3><p>On orders over Rs. 1,500</p></div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIconCircle}><Headset size={26} strokeWidth={1.5} /></div>
                <div className={styles.trustText}><h3>24/7 Support</h3><p>Dedicated customer care</p></div>
              </div>
              <div className={styles.trustItem}>
                <div className={styles.trustIconCircle}><RotateCcw size={26} strokeWidth={1.5} /></div>
                <div className={styles.trustText}><h3>7 Days Return</h3><p>Free return &amp; exchange</p></div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>



      {/* ─── 3. Brand Introduction (Our Heritage) with Parallax Image ─── */}
      <section className={styles.brandIntro}>
        <div className="container">
          <div className={styles.brandGrid}>
            <ScrollReveal delay={0.1} scale={0.97}>
              <Parallax speed={0.25}>
                <div className={styles.brandVisual}>
                  <Image src={pageContent['brand_image'] || "/brand_story.png"} alt="Delight Heritage" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              </Parallax>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className={styles.brandContent}>
                <span className={styles.sectionLabel}>OUR HERITAGE</span>
                <h2>{pageContent['brand_title'] || "A Legacy of Fragrance Since 2025"}</h2>
                <div style={{ display: 'none' }} id="debug-content-map">{JSON.stringify(pageContent)}</div>
                <p>{pageContent['brand_text1'] || "Delight Consumer Products Private Limited is the pioneer incense sticks and incense powder, candles and wax matches manufacturing conglomerate in Sri Lanka."}</p>
                <p>{pageContent['brand_text2'] || "The journey started with a vision of spreading fragrance around the Globe. At present we are the leading and fastest growing company for manufacturing, exporting and distributing supreme quality aromatic products across all provinces in the Domestic and Global market."}</p>
                <Link href="/about" className={styles.learnMoreBtn}>
                  Learn Our Story
                  <span className={styles.btnArrow}>→</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>



      {/* ─── 4. Shop by Category (Bento Grid) ─── */}
      <section className={styles.categorySection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeaderFlex} style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '60px' }}>
              <div>
                <span className={styles.sectionLabel}>{pageContent['categories_categories_label'] || 'EXPLORE'}</span>
                <SplitText text={pageContent['categories_categories_title'] || 'Shop by Category'} delay={0.2} className={styles.sectionTitleSplit} />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} y={60}>
            {loading ? (
              <CardSkeleton count={4} />
            ) : (
              <BentoCollections categories={categories} />
            )}
          </ScrollReveal>
        </div>
      </section>



      {/* ─── 5. Learn More About Our Products ─── */}
      <section className={styles.infoCardsSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeaderFlex}>
              <div>
                <span className={styles.sectionLabel}>DISCOVER</span>
                <h2>Learn More About Our Products</h2>
              </div>
              <div className={styles.sliderControls}>
                <button onClick={() => scrollContainer(infoCardsRef, 'left')} aria-label="Scroll info left"><ChevronLeft size={20} /></button>
                <button onClick={() => scrollContainer(infoCardsRef, 'right')} aria-label="Scroll info right"><ChevronRight size={20} /></button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className={styles.sliderContainer} ref={infoCardsRef}>
              {loading ? (
                <CardSkeleton count={3} />
              ) : (
                infoCards.map((card) => (
                  <div key={card.id} className={styles.infoCard}>
                    <div className={styles.infoCardImage}>
                      <Image src={card.image} alt={card.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 80vw, 400px" loading="lazy" />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardSubtitle}>{card.subtitle}</span>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <Link href={`/products/${card.slug}`} className={styles.infoCardBtn}>Learn More →</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>



      {/* ─── 6. Featured Products Slider ─── */}
      <section className={styles.productsSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeaderFlex}>
              <div>
                <span className={styles.sectionLabel}>SHOP OUR</span>
                <h2>Featured Products</h2>
              </div>
              <div className={styles.sliderControls}>
                <button onClick={() => scrollContainer(productsRef, 'left')} aria-label="Scroll products left"><ChevronLeft size={20} /></button>
                <button onClick={() => scrollContainer(productsRef, 'right')} aria-label="Scroll products right"><ChevronRight size={20} /></button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className={styles.sliderContainer} ref={productsRef}>
              {loading ? (
                <CardSkeleton count={4} />
              ) : (
                products.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <Link href={`/shop/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className={styles.productImageWrapper}>
                        <Image src={product.image} alt={product.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 640px) 100vw, 33vw" loading="lazy" />
                        {product.is_sale === 1 && <div className={styles.saleBadge}>SALE</div>}
                      </div>
                    </Link>
                    <div className={styles.productInfo}>
                      <Link href={`/shop/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3>{product.name}</h3>
                      </Link>
                      <div className={styles.priceContainer}>
                        {product.original_price && <span className={styles.oldPrice}>Rs. {product.original_price.toLocaleString()}</span>}
                        <span className={styles.newPrice}>Rs. {product.price.toLocaleString()}</span>
                      </div>
                      <Link href={`/shop/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
                        <button className={styles.addToCartLink}>View Product</button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className={styles.viewAllContainer}>
              <Link href="/shop" className={styles.viewAllBtn}>VIEW ALL PRODUCTS</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 7. Brands Marquee ─── */}
      {brands.length > 0 && (
        <section className={styles.brandsSection}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.brandsHeader}>
                <span className={styles.sectionLabel}>OUR PARTNERS</span>
                <h2>Trusted Brands</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={styles.marqueeWrapper}>
                <div className={styles.marqueeTrack}>
                  {[...brands, ...brands].map((brand, i) => (
                    <div key={`${brand.id}-${i}`} className={styles.brandLogo}>
                      <Image src={brand.image} alt={brand.name} fill style={{ objectFit: 'contain' }} sizes="150px" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ─── Promotional Popup (lazy loaded) ─── */}
      {showPopup && popup && (
        <PopupModal popup={popup} onDismiss={dismissPopup} />
      )}
    </div>
  );
}
