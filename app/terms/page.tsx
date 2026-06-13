'use client';

import { useEffect, useState } from 'react';
import styles from '../legal-styles.module.css';
import ScrollReveal from '@/components/ScrollReveal';

export default function TermsPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?page=terms')
      .then(r => r.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'eligibility', title: '2. Eligibility' },
    { id: 'accounts', title: '3. User Accounts' },
    { id: 'purchases', title: '4. Purchases & Payments' },
    { id: 'intellectual-property', title: '5. Intellectual Property' },
  ];

  if (loading) return <div style={{ paddingTop: '200px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.legalPage}>
      <header className={styles.hero}>
        <div className="container">
          <ScrollReveal>
            <h1>Terms of Service</h1>
          </ScrollReveal>
        </div>
      </header>

      <div className="container">
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <h2>Table of Contents</h2>
            <ul className={styles.navLinks}>
              {sections.map(s => (
                <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
              ))}
            </ul>
          </aside>

          <main className={styles.mainContent}>
            <ScrollReveal>
              {sections.map(section => (
                <section key={section.id} id={section.id} className={styles.section}>
                  <h2>{section.title}</h2>
                  <p>{content[section.id]?.text || 'Content coming soon...'}</p>
                </section>
              ))}
              <p className={styles.lastUpdated}>Last Updated: October 2025</p>
            </ScrollReveal>
          </main>
        </div>
      </div>
    </div>
  );
}
