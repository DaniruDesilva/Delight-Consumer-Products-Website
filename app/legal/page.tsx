'use client';

import { useEffect, useState } from 'react';
import styles from '../legal-styles.module.css';
import ScrollReveal from '@/components/ScrollReveal';

export default function LegalNoticePage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?page=legal')
      .then(r => r.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ paddingTop: '200px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.legalPage}>
      <header className={styles.hero}>
        <div className="container">
          <ScrollReveal>
            <h1>Legal Notice</h1>
          </ScrollReveal>
        </div>
      </header>

      <div className="container">
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <h2>Information</h2>
            <ul className={styles.navLinks}>
              <li><a href="#company">Company Info</a></li>
              <li><a href="#representatives">Representatives</a></li>
              <li><a href="#disclaimer">Disclaimer</a></li>
            </ul>
          </aside>

          <main className={styles.mainContent}>
            <ScrollReveal>
              <section id="company" className={styles.section}>
                <h2>Company Information</h2>
                <p>{content.company?.details || 'Content coming soon...'}</p>
              </section>

              <section id="representatives" className={styles.section}>
                <h2>Legal Representatives</h2>
                <p>{content.representatives?.text || 'Content coming soon...'}</p>
              </section>

              <section id="disclaimer" className={styles.section}>
                <h2>Disclaimer</h2>
                <p>{content.disclaimer?.text || 'Content coming soon...'}</p>
              </section>

              <p className={styles.lastUpdated}>Version 1.0 (Established 2025)</p>
            </ScrollReveal>
          </main>
        </div>
      </div>
    </div>
  );
}
