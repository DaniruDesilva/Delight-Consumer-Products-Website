import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { BASE_URL, localBusinessSchema, breadcrumbSchema } from '@/lib/seo';
import ContactForm from './ContactForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Delight Consumer Products. Visit us at Heenatiya, Balapitiya, Sri Lanka or reach us by email and phone. We\'d love to hear from you.',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/contact`,
    title: 'Contact Us | Delight Consumer Products',
    description: 'Reach Delight Consumer Products by email, phone, or visit our location in Balapitiya, Sri Lanka.',
  },
};

interface ContentRow { section: string; content_key: string; content_value: string; }

export default function ContactPage() {
  // Fetch content server-side
  const rows = db.getContent('contact') as ContentRow[];
  const content: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!content[row.section]) content[row.section] = {};
    content[row.section][row.content_key] = row.content_value;
  }
  const c = (section: string, key: string, fallback: string) => content?.[section]?.[key] || fallback;

  const address = c('info', 'address', "No 99/A 'Rohana' Heenatiya Balapitiya");
  const email = c('info', 'email', 'info@delightconsumerproducts.lk');
  const phone = c('info', 'phone', '+94 11 234 5678');

  // ─── JSON-LD ───────────────────────────────────────────────────────────────
  const localBizLd = localBusinessSchema();
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Contact', url: `${BASE_URL}/contact` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBizLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ContactForm address={address} email={email} phone={phone} />
    </>
  );
}
