import React from 'react';
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

// ─── Simple Markdown Parser ───────────────────────────────────────────────────
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return <p>Detailed information coming soon.</p>;
  
  // Quick pre-processing for lists to group them
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const pushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    line = line.trim();
    if (line.startsWith('- ')) {
      inList = true;
      listItems.push(<li key={`li-${idx}`}>{parseInline(line.slice(2))}</li>);
    } else {
      pushList();
      if (!line) {
        elements.push(<br key={`br-${idx}`} />);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${idx}`}>{parseInline(line.slice(3))}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${idx}`}>{parseInline(line.slice(2))}</h1>);
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={`bq-${idx}`}>{parseInline(line.slice(2))}</blockquote>);
      } else {
        // Normal paragraph. If it's the very first text paragraph, we can add a custom class for drop-cap.
        const isFirstPara = elements.filter(e => React.isValidElement(e) && e.type === 'p').length === 0;
        elements.push(<p key={`p-${idx}`} className={isFirstPara ? styles.firstParagraph : ''}>{parseInline(line)}</p>);
      }
    }
  });
  
  pushList();
  
  return elements;
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
            <div className={styles.heroContentInner}>
              <Link href="/" className={styles.backLink}>
                <ChevronLeft size={20} /> Back to Home
              </Link>
              <div className={styles.heroCard}>
                <ScrollReveal>
                  <span className={styles.subtitle}>{card.subtitle}</span>
                  <h1 className={styles.title}>{card.title}</h1>
                  <p className={styles.description}>{card.description}</p>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Detail Content Section */}
        <section className={styles.detailSection}>
          <div className="container">
            <div className={styles.contentGrid}>
              <ScrollReveal delay={0.2}>
                <div className={styles.richText}>
                  {parseMarkdown(card.detail_content)}
                </div>
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
