import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './about.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import Parallax from '@/components/Parallax';
import SplitText from '@/components/SplitText';
import { db } from '@/lib/db';
import { BASE_URL, localBusinessSchema, breadcrumbSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Delight Consumer Products (Pvt) Ltd is a proudly Sri Lankan manufacturing company, established in 2025 with a vision to deliver high-quality everyday essentials to modern households.',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/about`,
    title: 'About Us | Delight Consumer Products',
    description: 'Pioneer manufacturer of premium aromatic products in Sri Lanka. Learn our story, mission, and heritage.',
    images: [{ url: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477144/delight_static/dlr5ldfof9zr9jyfbs3e.jpg', alt: 'About Delight Consumer Products' }],
  },
};

interface ContentRow { section: string; content_key: string; content_value: string; }

// Helper to format text with newlines and bold markers
function formatText(text: string) {
  if (!text) return null;
  return text.split('\n').map((paragraph, index) => {
    if (!paragraph.trim()) return <br key={index} />;
    
    // Simple markdown-like bold parser (**text**)
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    
    return (
      <p key={index}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
}

export default function AboutPage() {
  const rows = db.getContent('about') as ContentRow[];
  const content: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!content[row.section]) content[row.section] = {};
    content[row.section][row.content_key] = row.content_value;
  }
  const c = (section: string, key: string, fallback: string = '') => content?.[section]?.[key] || fallback;

  const localBizLd = localBusinessSchema();
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'About Us', url: `${BASE_URL}/about` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBizLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className={styles.aboutPage}>
        {/* 1. Hero Section */}
        <section className={styles.hero}>
          <Parallax speed={0.4} className={styles.heroBackground}>
            <Image
              src={c('hero', 'image', 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477144/delight_static/dlr5ldfof9zr9jyfbs3e.jpg')}
              alt="About Delight Consumer Products"
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="100vw"
            />
            <div className={styles.overlay}></div>
          </Parallax>
          <div className={`container ${styles.heroContent}`}>
            <h1><SplitText text={c('hero', 'title', 'About Us')} delay={0.1} /></h1>
            <ScrollReveal delay={0.4} y={20}>
              <p className={styles.heroSubtitle}>{c('hero', 'subtitle', 'Bringing quality and tradition into every home.')}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Who We Are */}
        <section className={styles.whoWeAre}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.centeredHeader}>
                <span className={styles.subtitle}>Introduction</span>
                <h2><SplitText text={c('who_we_are', 'title', 'Who We Are')} /></h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2} y={30}>
              <div className={styles.introText}>
                {formatText(c('who_we_are', 'text'))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 3. What We Do */}
        <section className={styles.whatWeDo}>
          <div className="container">
            <div className={styles.grid2}>
              <ScrollReveal delay={0.1}>
                <div className={styles.visualContainer}>
                  <Image
                    src={c('what_we_do', 'image', 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477147/delight_static/hh4rlbmhmxr7dpgbnkqz.jpg')}
                    alt="What We Do"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </ScrollReveal>
              <div className={styles.textContent}>
                <ScrollReveal delay={0.2}>
                  <span className={styles.subtitle}>Our Craft</span>
                  <h2><SplitText text={c('what_we_do', 'title', 'What We Do')} /></h2>
                  <div className={styles.formattedText}>
                    {formatText(c('what_we_do', 'text'))}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Mission & Vision */}
        <section className={styles.missionVision}>
          <div className="container">
            <div className={styles.grid2}>
              <ScrollReveal delay={0.1} y={40}>
                <div className={styles.cardBox}>
                  <span className={styles.subtitle}>Core Purpose</span>
                  <h3>{c('mission', 'title', 'Our Mission')}</h3>
                  <div className={styles.cardText}>
                    {formatText(c('mission', 'text'))}
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} y={40}>
                <div className={styles.cardBox}>
                  <span className={styles.subtitle}>Future Goal</span>
                  <h3>{c('vision', 'title', 'Our Vision')}</h3>
                  <div className={styles.cardText}>
                    {formatText(c('vision', 'text'))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 5. Our Commitment */}
        <section className={styles.commitment}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.centeredHeader}>
                <span className={styles.subtitle}>Pillars</span>
                <h2><SplitText text={c('commitment', 'title', 'Our Commitment')} /></h2>
              </div>
            </ScrollReveal>
            <div className={styles.commitmentGrid}>
              {[1, 2, 3, 4].map((num, i) => {
                const text = c('commitment', `item${num}`);
                if (!text) return null;
                return (
                  <ScrollReveal key={num} delay={0.1 + i * 0.1} y={20}>
                    <div className={styles.commitmentItem}>
                      <div className={styles.commitmentNumber}>0{num}</div>
                      <h4>{text}</h4>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Our Journey */}
        <section className={styles.journey}>
          <div className="container">
            <ScrollReveal>
              <div className={styles.journeyBox}>
                <span className={styles.subtitle}>Looking Ahead</span>
                <h2>{c('journey', 'title', 'Our Journey')}</h2>
                <div className={styles.journeyText}>
                  {formatText(c('journey', 'text'))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Brand Banner */}
        <ScrollReveal>
          <section className={styles.partners}>
            <div className="container">
              <div className={styles.partnerFlex}>
                <div className={styles.partnerLogo}>DELIGHT</div>
                <div className={styles.partnerLogo}>TRADITION</div>
                <div className={styles.partnerLogo}>QUALITY</div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </>
  );
}
