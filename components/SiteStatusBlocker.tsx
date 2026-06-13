'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SiteStatusBlocker({
  status,
  children
}: {
  status: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);

  // Always allow access to admin and api routes, and let logged in admins see the storefront
  const isAdminOrApi = pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next');

  useEffect(() => {
    if (!isAdminOrApi && status !== 'live' && status) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          setIsAdminLoggedIn(!!data?.admin);
        })
        .catch(() => setIsAdminLoggedIn(false));
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [isAdminOrApi, status]);

  if (isAdminOrApi || status === 'live' || !status || isAdminLoggedIn === true) {
    return <>{children}</>;
  }

  // Common styling constants
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#FAF9F6',
    color: '#1c1917',
    textAlign: 'center',
    fontFamily: 'var(--font-body), sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading), serif',
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 600,
    marginTop: '2rem',
    marginBottom: '1rem',
    color: '#1a3622' // Deep green brand color
  };

  const textStyle: React.CSSProperties = {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    maxWidth: '600px',
    lineHeight: 1.6,
    color: '#4b5563',
    marginBottom: '2.5rem'
  };

  const logoWrapperStyle: React.CSSProperties = {
    marginBottom: '2rem'
  };

  if (status === 'maintenance') {
    return (
      <div style={containerStyle}>
        <div style={logoWrapperStyle}>
          <Image
            src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png"
            alt="Delight Consumer Products Logo"
            width={180}
            height={60}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h1 style={headerStyle}>We'll Be Right Back</h1>
        <p style={textStyle}>
          We are currently updating our website to bring you a better experience.
          Thank you for your patience and support. We will be back online shortly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="mailto:info@delight.lk" style={{ padding: '12px 24px', backgroundColor: '#1a3622', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (status === 'coming_soon') {
    return (
      <div style={containerStyle}>
        <div style={logoWrapperStyle}>
          <Image
            src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png"
            alt="Delight Consumer Products Logo"
            width={200}
            height={65}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h1 style={headerStyle}>Something Beautiful is Coming</h1>
        <p style={textStyle}>
          We are building a brand new aromatic experience for you.
          Our new online store is launching very soon. Get ready to explore our supreme range of products.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          maxWidth: '450px',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1a3622', fontFamily: 'var(--font-heading)' }}>For Inquiries</h3>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}><strong>Email:</strong> support@delightconsumerproducts.lk</p>
          <p style={{ margin: 0, color: '#4b5563' }}><strong>Phone:</strong> +94 777 330 093</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
