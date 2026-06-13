import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Delight Consumer Products team. Explore open positions in Sales, Production, Marketing, and more. Build the future of aromatic wellness in Sri Lanka.',
  alternates: { canonical: 'https://www.delightconsumerproducts.lk/careers' },
  openGraph: {
    type: 'website',
    url: 'https://www.delightconsumerproducts.lk/careers',
    title: 'Careers | Delight Consumer Products',
    description: 'Explore job openings at Delight Consumer Products. Join a team dedicated to Sri Lankan craftsmanship and global excellence.',
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
