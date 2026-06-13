import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our full range of premium incense sticks, air fresheners, perfumes, candles, and aromatic products. Crafted in Sri Lanka by Delight Consumer Products.',
  alternates: { canonical: 'https://www.delightconsumerproducts.lk/shop' },
  openGraph: {
    type: 'website',
    url: 'https://www.delightconsumerproducts.lk/shop',
    title: 'Shop All Products | Delight Consumer Products',
    description: 'Browse premium incense, air fresheners, perfumes and candles crafted in Sri Lanka.',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
