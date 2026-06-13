'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Package, Truck, ShieldCheck } from 'lucide-react';
import styles from './faq.module.css';
import ScrollReveal from '@/components/ScrollReveal';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.json())
      .then(data => {
        setFaqs(data.faqs || []);
        setLoading(false);
      });
  }, []);

  const toggleItem = (q: string) => {
    setOpenItems(prev => 
      prev.includes(q) ? prev.filter(i => i !== q) : [...prev, q]
    );
  };

  // Group FAQs by category
  const categories: Record<string, FAQ[]> = {};
  faqs.forEach(f => {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(f);
  });

  const getIcon = (cat: string) => {
    switch(cat.toLowerCase()) {
      case 'general': return <HelpCircle size={24} />;
      case 'shipping': return <Truck size={24} />;
      case 'returns': return <Package size={24} />;
      default: return <ShieldCheck size={24} />;
    }
  };

  return (
    <div className={styles.faqPage}>
      <div className="container">
        <ScrollReveal>
          <header className={styles.hero}>
            <h1>Frequently Asked Questions</h1>
            <p>Everything you need to know about our products, shipping, and more. Can't find the answer? Reach out to us directly.</p>
          </header>
        </ScrollReveal>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading questions...</div>
        ) : (
          <div className={styles.faqContainer}>
            {Object.entries(categories).map(([cat, items], catIdx) => (
              <div key={cat} className={styles.categorySection}>
                <ScrollReveal delay={catIdx * 0.1}>
                  <h2>
                    {getIcon(cat)}
                    {cat}
                  </h2>
                </ScrollReveal>
                
                <div className={styles.accordion}>
                  {items.map((item, itemIdx) => (
                    <ScrollReveal key={item.id} delay={(catIdx + itemIdx) * 0.05}>
                      <div className={`${styles.item} ${openItems.includes(item.question) ? styles.itemOpen : ''}`}>
                        <button className={styles.question} onClick={() => toggleItem(item.question)}>
                          <h3>{item.question}</h3>
                          <ChevronDown className={styles.icon} size={20} />
                        </button>
                        <div className={styles.answer}>
                          <div className={styles.answerInner}>
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
