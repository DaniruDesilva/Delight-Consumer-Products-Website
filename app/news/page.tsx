import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import styles from './news.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import { db } from '@/lib/db';
import { BASE_URL } from '@/lib/seo';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string;
}

export const metadata: Metadata = {
  title: 'News & Articles',
  description: 'Stay up to date with the latest news, product launches, and brand stories from Delight Consumer Products — Sri Lanka\'s leading aromatic product manufacturer.',
  alternates: { canonical: `${BASE_URL}/news` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/news`,
    title: 'News & Articles | Delight Consumer Products',
    description: 'Latest news, product launches, and brand stories from Delight Consumer Products.',
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function NewsPage() {
  // Fetch directly from DB — server component
  const articles = db.instance
    .prepare("SELECT id, title, slug, excerpt, image_url, published_at FROM news_articles WHERE status = 'active' ORDER BY published_at DESC")
    .all() as Article[];

  return (
    <div className={styles.newsPage}>
      <div className="container">
        <ScrollReveal>
          <header className={styles.hero}>
            <h1>News &amp; Articles</h1>
            <p>Our latest updates, brand stories, and insights into the world of aromatic luxury.</p>
          </header>
        </ScrollReveal>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <p>No articles found. Stay tuned for updates!</p>
          </div>
        ) : (
          <div className={styles.newsGrid}>
            {articles.map((article, index) => (
              <ScrollReveal key={article.id} delay={index * 0.1}>
                <article className={styles.articleCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      {...(index < 3 ? { priority: true } : { loading: 'lazy' })}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.date}>
                      <Calendar size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />
                      {formatDate(article.published_at)}
                    </span>
                    <h2>{article.title}</h2>
                    <p className={styles.excerpt}>{article.excerpt}</p>
                    <Link href={`/news/${article.slug}`} className={styles.readMore}>
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
