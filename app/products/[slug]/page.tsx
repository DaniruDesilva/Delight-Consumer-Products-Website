import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import styles from './page.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import { ChevronLeft } from 'lucide-react';
import { BASE_URL, articleSchema, breadcrumbSchema } from '@/lib/seo';

interface ProductInfoCard {
  id: number; title: string; subtitle: string; description: string;
  image: string; slug: string; detail_content: string; detail_image: string;
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const card = db.instance
    .prepare('SELECT * FROM product_info_cards WHERE slug = ? AND is_active = 1')
    .get(slug) as ProductInfoCard | undefined;

  if (!card) return { title: 'Product Information | Delight Consumer Products' };

  const canonicalUrl = `${BASE_URL}/products/${card.slug}`;
  return {
    title: card.title,
    description: card.description || `Learn about ${card.title} — premium aromatic products by Delight Consumer Products, Sri Lanka.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: `${card.title} | Delight Consumer Products`,
      description: card.description,
      images: card.image ? [{ url: card.image.startsWith('http') ? card.image : `${BASE_URL}${card.image}`, alt: card.title }] : [],
    },
  };
}

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ProductInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const card = db.instance
    .prepare('SELECT * FROM product_info_cards WHERE slug = ? AND is_active = 1')
    .get(slug) as ProductInfoCard | undefined;

  if (!card) notFound();

  // ─── JSON-LD ───────────────────────────────────────────────────────────────
  const articleLd = articleSchema({
    title: card.title,
    slug: card.slug,
    excerpt: card.description,
    image_url: card.image,
    published_at: new Date().toISOString(),
  });
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Products', url: `${BASE_URL}/products` },
    { name: card.title, url: `${BASE_URL}/products/${card.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className={styles.pageContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <Image src={card.image} alt={card.title} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
            <div className={styles.heroOverlay}></div>
          </div>

          <div className={`container ${styles.heroContent}`}>
            <Link href="/" className={styles.backLink}>
              <ChevronLeft size={20} /> Back to Home
            </Link>
            <ScrollReveal>
              <span className={styles.subtitle}>{card.subtitle}</span>
              <h1 className={styles.title}>{card.title}</h1>
              <p className={styles.description}>{card.description}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Detail Content Section */}
        <section className={styles.detailSection}>
          <div className="container">
            <div className={styles.contentGrid}>
              <ScrollReveal delay={0.2}>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: card.detail_content || '<p>Detailed information coming soon.</p>' }} />
              </ScrollReveal>

              {card.detail_image && (
                <ScrollReveal delay={0.4}>
                  <div className={styles.detailImageWrapper}>
                    <Image src={card.detail_image} alt={`${card.title} Details`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 50vw" />
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container text-center">
            <ScrollReveal>
              <h2>Ready to experience {card.title.toLowerCase()}?</h2>
              <div className={styles.ctaButtons}>
                <Link href={`/shop?category=${encodeURIComponent(card.title)}`} className={styles.primaryBtn}>
                  Shop Collection
                </Link>
                <Link href="/contact" className={styles.secondaryBtn}>
                  Contact Us
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
