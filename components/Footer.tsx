'use client';

import Link from 'next/link';
import { Mail, Phone, Send, MapPin, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

const Facebook = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Youtube = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const TikTok = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => setSettings(d.settings || {}));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className={styles.footerWrapper}>
      {/* TIER 1: Newsletter Hero */}
      <div className={styles.newsletterSection}>
        <div className="container">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterText}>
              <h2>Join the Delight Community</h2>
              <p>Subscribe to receive exclusive offers, new product announcements, and aromatic inspiration directly to your inbox.</p>
            </div>
            <div className={styles.newsletterFormWrapper}>
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <div className={styles.inputGroup}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input type="email" placeholder="Your email address" required className={styles.newsletterInput} value={email} onChange={(e) => setEmail(e.target.value)} disabled={status === 'loading'} suppressHydrationWarning />
                  <button type="submit" className={styles.newsletterButton} disabled={status === 'loading'} suppressHydrationWarning>
                    {status === 'loading' ? <Loader2 size={18} className={styles.spin} /> : <Send size={18} />}
                  </button>
                </div>
                {status === 'success' && (
                  <div className={styles.statusMessage} style={{ color: '#bbf7d0' }}><CheckCircle size={14} /> {message}</div>
                )}
                {status === 'error' && (
                  <div className={styles.statusMessage} style={{ color: '#fca5a5' }}><AlertCircle size={14} /> {message}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Main Asymmetric Grid */}
      <div className={styles.mainFooter}>
        <div className={`container ${styles.footerGrid}`}>
          {/* Brand Anchor */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoWrapper}>
              <Image src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png" alt="Delight Logo" width={160} height={54} className={styles.logo} />
            </Link>
            <p className={styles.brandManifesto}>
              {settings.footer_manifesto || "Pioneering Sri Lanka's finest aromatic experiences since 1995. Crafted by nature, designed for your ultimate relaxation and peace."}
            </p>
            <div className={styles.contactList}>
              <a href={`tel:${settings.contact_phone || '+94112345678'}`} className={styles.contactItem}>
                <div className={styles.contactIcon}><Phone size={16} /></div>
                <span>{settings.contact_phone || '+94 11 234 5678'}</span>
              </a>
              <a href={`mailto:${settings.contact_email || 'info@delight.lk'}`} className={styles.contactItem}>
                <div className={styles.contactIcon}><Mail size={16} /></div>
                <span>{settings.contact_email || 'info@delight.lk'}</span>
              </a>
              <div className={styles.contactItem} style={{pointerEvents: 'none'}}>
                <div className={styles.contactIcon}><MapPin size={16} /></div>
                <span>{settings.contact_address || 'No 99/A \'Rohana\' Heenatiya Balapitiya'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Group */}
          <div className={styles.navGroup}>
            <div className={styles.linkCol}>
              <h3>Discover</h3>
              <ul className={styles.linkList}>
                <li><Link href="/shop" className={styles.footerLink}>Shop All Products</Link></li>
                <li><Link href="/about" className={styles.footerLink}>Our Heritage</Link></li>
                <li><Link href="/news" className={styles.footerLink}>News & Articles</Link></li>
                <li><Link href="/careers" className={styles.footerLink}>Careers</Link></li>
                <li><Link href="/contact" className={styles.footerLink}>Contact Us</Link></li>
              </ul>
            </div>
            
            <div className={styles.linkCol}>
              <h3>Assistance</h3>
              <ul className={styles.linkList}>
                <li><Link href="/account" className={styles.footerLink}>My Account</Link></li>
                <li><Link href="/track-order" className={styles.footerLink}>Track Order</Link></li>
                <li><Link href="/faq" className={styles.footerLink}>FAQ & Help</Link></li>
                <li><Link href="/returns" className={styles.footerLink}>Returns</Link></li>
                <li><Link href="/account?tab=wishlist" className={styles.footerLink}>Wishlist</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.trustCol}>
            <h3>Reach Out Quickly</h3>
            <a href={`https://wa.me/${(settings.whatsapp || '94771234567').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
              <div className={styles.waIconWrapper}>
                <MessageCircle size={20} />
              </div>
              <span className={styles.waButtonText}>Chat with us on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* TIER 3: The Base */}
      <div className={styles.footerBottom}>
        <div className={`container ${styles.bottomFlex}`}>
          <div className={styles.legalLinks}>
            <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
            <span className={styles.bullet}>&bull;</span>
            <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
            <span className={styles.bullet}>&bull;</span>
            <Link href="/legal" className={styles.bottomLink}>Legal Notice</Link>
          </div>

          <div className={styles.copyright}>
            <p>&copy; {new Date().getFullYear()} Delight Consumer Products. All Rights Reserved.</p>
            <p className={styles.developerCredit}>Developed with <span style={{ color: '#d7ccc8' }}>♥</span> by <strong>Daniru De Silva</strong></p>
          </div>

          <div className={styles.socialRow}>
            <a href="#" className={styles.socialIconB} aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className={styles.socialIconB} aria-label="TikTok">
              <TikTok size={18} />
            </a>
            <a href="#" className={styles.socialIconB} aria-label="YouTube">
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
