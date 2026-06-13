'use client';

import Image from 'next/image';
import { MapPin, Mail, Phone, Send } from 'lucide-react';
import styles from './contact.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import { useState } from 'react';

// Contact form as a separate client component
export default function ContactForm({ address, email, phone }: { address: string; email: string; phone: string; }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* 1. Hero Section — static, rendered server-side via parent */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477149/delight_static/ccn1k5o7xu2g99kukb8v.jpg"
            alt="Contact Delight Consumer Products"
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
          <div className={styles.overlay}></div>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1>Contact Us</h1>
        </div>
      </section>

      {/* 2. Get In Touch Section */}
      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactGrid}>

            {/* Left: Contact Info */}
            <ScrollReveal delay={0.1}>
              <div className={styles.infoCol}>
                <span className={styles.subtitle}>Contact &amp; Reach Us</span>
                <h2>Get In Touch</h2>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}>
                      <MapPin size={24} strokeWidth={1.5} />
                    </div>
                    <div className={styles.infoText}>
                      <h3>Location Details</h3>
                      <p>{address}</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}>
                      <Mail size={24} strokeWidth={1.5} />
                    </div>
                    <div className={styles.infoText}>
                      <h3>Email Address</h3>
                      <p>{email}</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}>
                      <Phone size={24} strokeWidth={1.5} />
                    </div>
                    <div className={styles.infoText}>
                      <h3>Phone Number</h3>
                      <p>{phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Contact Form */}
            <ScrollReveal delay={0.3}>
              <div className={styles.formCol}>
                {status === 'sent' ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Send size={40} style={{ color: 'var(--primary)', marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
                  </div>
                ) : (
                  <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <input
                        type="email"
                        placeholder="Your Email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="Subject"
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <textarea
                        placeholder="Your Message..."
                        rows={6}
                        required
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
                      {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
                    </button>
                    {status === 'error' && <p style={{ color: 'red', marginTop: 8 }}>Something went wrong. Please try again.</p>}
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. Google Map — width/height specified to prevent CLS */}
      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.385587784013!2d80.0381623!3d6.4716167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae245d81aaaaaab%3A0xbbbbb!2sHeenatiya%2C%20Balapitiya!5e0!3m2!1sen!2slk!4v1713184000000!5m2!1sen!2slk"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Delight Consumer Products Store Location — Balapitiya, Sri Lanka"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
