'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const [consent, setConsent] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [sessionId, setSessionId] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for consent
    const stored = localStorage.getItem('delight_cookie_consent');
    if (stored) {
      setConsent(stored as 'accepted' | 'rejected');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('delight_cookie_consent', 'accepted');
    setConsent('accepted');
    initSession();
  };

  const handleReject = () => {
    localStorage.setItem('delight_cookie_consent', 'rejected');
    setConsent('rejected');
  };

  const initSession = () => {
    let sid = sessionStorage.getItem('delight_analytics_session');
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('delight_analytics_session', sid);
    }
    setSessionId(sid);
  };

  // Run on mount if accepted
  useEffect(() => {
    if (consent === 'accepted') {
      initSession();
    }
  }, [consent]);

  // Track page views
  useEffect(() => {
    if (consent !== 'accepted' || !sessionId) return;
    
    const sendEvent = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            event: 'pageview',
            deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
          }),
          keepalive: true
        });
      } catch (e) {}
    };
    sendEvent();
  }, [pathname, consent, sessionId]);

  // Ping for duration tracking
  useEffect(() => {
    if (consent !== 'accepted' || !sessionId) return;
    
    // Ping every 15 seconds to record duration
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        try {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              event: 'ping',
              durationIncrement: 15
            }),
            keepalive: true
          });
        } catch (e) {}
      }
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [consent, sessionId]);

  if (consent !== 'pending') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: '#fff',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      borderRadius: 12,
      padding: '20px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: 15,
      border: '1px solid #e5e7eb',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>We value your privacy</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button 
          onClick={handleReject}
          suppressHydrationWarning
          style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
          Reject All
        </button>
        <button 
          onClick={handleAccept}
          suppressHydrationWarning
          style={{ background: '#166534', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
          Accept All
        </button>
      </div>
    </div>
  );
}
