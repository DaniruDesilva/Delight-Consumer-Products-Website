'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function SiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      {isAdmin ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main style={{ paddingTop: 0 }}>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
