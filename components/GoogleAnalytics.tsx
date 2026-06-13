'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    // Only run on client and if script doesn't already exist
    if (typeof window === 'undefined' || !gaId) return;
    if (document.getElementById('ga-script')) return;
    
    // Inject gtag.js
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script1.id = 'ga-script';
    document.head.appendChild(script1);

    // Inject initialization config
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(script2);
  }, [gaId]);

  return null;
}
