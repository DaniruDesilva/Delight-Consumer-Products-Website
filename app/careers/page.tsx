'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowRight, Star, Heart, Lightbulb, Users, Target, Shield, BookOpen, Smile } from 'lucide-react';
import styles from './careers.module.css';
import ScrollReveal from '@/components/ScrollReveal';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const t = Date.now();
    Promise.all([
      fetch(`/api/jobs?t=${t}`).then(r => r.ok ? r.json() : { jobs: [] }).catch(() => ({ jobs: [] })),
      fetch(`/api/content?page=careers&t=${t}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
    ]).then(([jobData, contentData]) => {
      setJobs(jobData.jobs || []);
      const mappedContent: Record<string, string> = {};
      const data = contentData as any;
      if (data && typeof data === 'object' && !data.error) {
        for (const section in data) {
          for (const key in data[section]) {
            mappedContent[`${section}_${key}`] = data[section][key];
          }
        }
      }
      setContent(mappedContent || {});
      setLoading(false);
    });
  }, []);

  const departments = ['All', ...new Set(jobs.map(j => j.department))];
  const filteredJobs = filter === 'All' ? jobs : jobs.filter(j => j.department === filter);

  // Helper to get content with fallback
  const c = (key: string, fallback: string) => content[key] || fallback;

  // Use dynamic image with fallback gradient
  const heroStyle = c('hero_image', '')
    ? { backgroundImage: `linear-gradient(135deg, rgba(26, 46, 32, 0.85) 0%, rgba(58, 107, 76, 0.75) 50%, rgba(74, 51, 32, 0.85) 100%), url(${content.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className={styles.careersPage}>
      {/* Hero Section */}
      <section className={styles.hero} style={heroStyle}>
        <div className="container">
          <div className={styles.heroLayout}>
            <ScrollReveal>
              <div className={styles.heroContent}>
                <span className={styles.categoryLabel}>{c('hero_label', 'Join Our Legacy')}</span>
                <h1>{c('hero_title', 'Build the Future of Aromatic Wellness')}</h1>
                <p>{c('hero_subtitle', 'At Delight, we don\'t just make products; we create experiences. Join a team dedicated to Sri Lankan craftsmanship and global excellence.')}</p>
                
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <strong>{c('heritage_stat1_val', '30+')}</strong>
                    <span>{c('heritage_stat1_label', 'Years Heritage')}</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{c('heritage_stat2_val', '250+')}</strong>
                    <span>{c('heritage_stat2_label', 'Team Members')}</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>{c('heritage_stat3_val', '12')}</strong>
                    <span>{c('heritage_stat3_label', 'Product Lines')}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={styles.heroImageWrapper}>
                <img src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png" alt="Delight Logo" className={styles.heroLogo} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2>{c('values_title', 'Why Work With Us?')}</h2>
              <p>{c('values_subtitle', 'We provide a collaborative environment where tradition meets innovation.')}</p>
            </div>
          </ScrollReveal>

          <div className={styles.valuesGrid}>
            <ScrollReveal delay={0.1}>
              <div className={styles.valueCard}>
                <div className={styles.iconWrapper}>
                  <Target size={28} />
                </div>
                <h3>{c('values_card1_title', 'Craftsmanship')}</h3>
                <p>{c('values_card1_text', 'Learn from the finest artisans in the industry and master the secrets of aromatic blending.')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={styles.valueCard}>
                <div className={styles.iconWrapper}>
                  <Users size={28} />
                </div>
                <h3>{c('values_card2_title', 'Community')}</h3>
                <p>{c('values_card2_text', 'We are a family-owned business that treats every employee with respect and local warmth.')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className={styles.valueCard}>
                <div className={styles.iconWrapper}>
                  <Lightbulb size={28} />
                </div>
                <h3>{c('values_card3_title', 'Innovation')}</h3>
                <p>{c('values_card3_text', 'Work with state-of-the-art manufacturing facilities to define the next generation of wellness.')}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Perks & Benefits Section (NEW) */}
      <section className={styles.perksSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2>{c('perks_title', 'Perks & Benefits')}</h2>
              <p>{c('perks_subtitle', 'We take care of our people so they can take care of our customers.')}</p>
            </div>
          </ScrollReveal>

          <div className={styles.perksGrid}>
            <ScrollReveal delay={0.1}>
              <div className={styles.perkItem}>
                <Heart size={32} color="#3a6b4c" />
                <h3>{c('perks_item1_title', 'Health & Wellness')}</h3>
                <p>{c('perks_item1_text', 'Comprehensive medical coverage and wellness programs for you and your family.')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={styles.perkItem}>
                <BookOpen size={32} color="#8b5a2b" />
                <h3>{c('perks_item2_title', 'Continuous Learning')}</h3>
                <p>{c('perks_item2_text', 'We sponsor your growth with training programs and educational allowances.')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className={styles.perkItem}>
                <Smile size={32} color="#ffd700" />
                <h3>{c('perks_item3_title', 'Work-Life Harmony')}</h3>
                <p>{c('perks_item3_text', 'Flexible working hours and generous paid time off policies.')}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className={styles.perkItem}>
                <Star size={32} color="#3a6b4c" />
                <h3>{c('perks_item4_title', 'Employee Discounts')}</h3>
                <p>{c('perks_item4_text', 'Exclusive rates on our entire range of aromatic and lifestyle products.')}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Employee Quote Section (NEW) */}
      <section className={styles.quoteSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.quoteContent}>
              <p className={styles.quoteText}>
                {c('quote_text', 'Working at Delight is more than a job. It\'s a family that nurtures your ambition and rewards your dedication to craftsmanship.')}
              </p>
              <div className={styles.quoteAuthor}>
                {c('quote_author', 'Sarah Fernando, Lead Product Developer')}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Openings Section */}
      <section className={styles.openingsSection} id="open-positions">
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2>Current Openings</h2>
              <p>Find your next big opportunity with Delight.</p>
            </div>
          </ScrollReveal>

          <div className={styles.openingsLayout}>
            {/* Sidebar Filter */}
            <div className={styles.filterSidebar}>
              <h3>Departments</h3>
              <div className={styles.filterList}>
                {departments.map(dept => (
                  <button
                    key={dept}
                    className={`${styles.filterBtn} ${filter === dept ? styles.active : ''}`}
                    onClick={() => setFilter(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs List */}
            <div>
              {loading ? (
                <div className={styles.loader}>Loading opportunities...</div>
              ) : (
                <div className={styles.jobsGrid}>
                  {filteredJobs.map((job, idx) => (
                    <ScrollReveal key={job.id} delay={idx * 0.05}>
                      <Link href={`/careers/${job.id}`} className={styles.jobCard}>
                        <div className={styles.jobInfo}>
                          <span className={styles.deptBadge}>{job.department}</span>
                          <h3>{job.title}</h3>
                          <div className={styles.jobMeta}>
                            <span><MapPin size={16} /> {job.location}</span>
                            <span><Clock size={16} /> {job.type}</span>
                          </div>
                        </div>
                        <div className={styles.jobAction}>
                          Apply Now <ArrowRight size={18} />
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                  {filteredJobs.length === 0 && (
                    <div className={styles.noJobs}>
                      <h3>No positions available in {filter}</h3>
                      <p>Please check back later or send a spontaneous application below.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Spontaneous Application */}
      <section className={styles.spontaneousSection}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.spontaneousCard}>
              <div className={styles.spontaneousText}>
                <h2>{c('spontaneous_title', 'Don\'t see the right fit?')}</h2>
                <p>{c('spontaneous_text', 'We are always looking for passionate people to join our legacy. Send us your CV for future consideration.')}</p>
              </div>
              <Link href="/careers/applications?type=spontaneous" className={styles.btnPrimary}>
                Submit your CV <ArrowRight size={20} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
