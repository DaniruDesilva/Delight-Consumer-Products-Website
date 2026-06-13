import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Delight Consumer Products — shipping, returns, product info, and more.',
  alternates: { canonical: 'https://www.delightconsumerproducts.lk/faq' },
  openGraph: {
    type: 'website',
    url: 'https://www.delightconsumerproducts.lk/faq',
    title: 'FAQ | Delight Consumer Products',
    description: 'Answers to your most common questions about our products, shipping, and returns.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
