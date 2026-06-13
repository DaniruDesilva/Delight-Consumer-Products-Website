import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import styles from '../news.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import { db } from '@/lib/db';
import { BASE_URL, articleSchema, breadcrumbSchema } from '@/lib/seo';

interface Article {
  id: number; title: string; slug: string; content: string;
  excerpt: string; image_url: string; published_at: string; updated_at: string;
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = db.instance
    .prepare("SELECT * FROM news_articles WHERE slug = ? AND status = 'active'")
    .get(slug) as Article | undefined;

  if (!article) return { title: 'Article Not Found | Delight Consumer Products' };

  const canonicalUrl = `${BASE_URL}/news/${article.slug}`;
  const imageUrl = article.image_url.startsWith('http') ? article.image_url : `${BASE_URL}${article.image_url}`;

  return {
    title: article.title,
    description: article.excerpt || article.title,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: `${article.title} | Delight Consumer Products`,
      description: article.excerpt || article.title,
      images: [{ url: imageUrl, alt: article.title }],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: [imageUrl],
    },
  };
}

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ArticleDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = db.instance
    .prepare("SELECT * FROM news_articles WHERE slug = ? AND status = 'active'")
    .get(slug) as Article | undefined;

  if (!article) notFound();

  // ─── JSON-LD ───────────────────────────────────────────────────────────────
  const articleLd = articleSchema({
    title: article!.title,
    slug: article!.slug,
    excerpt: article!.excerpt,
    image_url: article!.image_url,
    published_at: article!.published_at,
    updated_at: article!.updated_at,
  });
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'News', url: `${BASE_URL}/news` },
    { name: article!.title, url: `${BASE_URL}/news/${article!.slug}` },
  ]);

  const formattedDate = new Date(article!.published_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className={styles.newsPage}>
        <div className="container">
          <ScrollReveal>
            <Link href="/news" className={styles.readMore} style={{ marginBottom: '40px', display: 'inline-flex' }}>
              <ArrowLeft size={16} /> Back to News
            </Link>
          </ScrollReveal>

          <article style={{ maxWidth: '900px', margin: '0 auto' }}>
            <ScrollReveal>
              <div className={styles.date} style={{ marginBottom: '16px' }}>
                <Calendar size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />
                {formattedDate}
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '40px', lineHeight: 1.2 }}>
                {article!.title}
              </h1>

              <div className={styles.imageWrapper} style={{ height: '500px', borderRadius: '24px', marginBottom: '60px' }}>
                <Image
                  src={article!.image_url}
                  alt={article!.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  sizes="(max-width: 900px) 100vw, 900px"
                />
              </div>

              <div style={{ fontSize: '18px', lineHeight: 1.9, color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
                {article!.content}
              </div>

              <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Established in 2025 - Delight Consumer Products</p>
                <ShareButton />
              </div>
            </ScrollReveal>
          </article>
        </div>
      </div>
    </>
  );
}

// Small client component just for the share button
function ShareButton() {
  return (
    <button
      className={styles.readMore}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      // Using onclick as a string attribute works in server components for simple interactions
    >
      <Share2 size={18} /> Share Article
    </button>
  );
}
