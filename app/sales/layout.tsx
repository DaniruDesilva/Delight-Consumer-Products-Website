'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import SalesSidebar from '@/components/sales/SalesSidebar';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [salesRep, setSalesRep] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/sales/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthed(true);
      return;
    }

    fetch('/api/auth/sales/me')
      .then(res => res.json())
      .then(data => {
        if (data.salesRep) {
          setSalesRep(data.salesRep);
          setIsAuthed(true);
        } else {
          router.replace('/sales/login');
        }
      })
      .catch(() => {
        router.replace('/sales/login');
      });
  }, [pathname, isLoginPage, router]);

  if (!isAuthed) return null; // Or a loading spinner

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <SalesSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main style={{ 
        flex: 1, 
        marginLeft: 0, 
        width: '100%', 
        transition: 'margin 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Topbar for mobile toggle and profile summary */}
        <header style={{
          background: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 80
        }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            className="mobileMenuBtn"
          >
            <Menu size={24} color="#0f172a" />
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                {salesRep?.full_name || 'Sales Rep'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {salesRep?.territory || 'Unassigned Territory'}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              color: '#334155'
            }}>
              {salesRep?.full_name ? salesRep.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
        </header>

        <div style={{ padding: '24px', flex: 1, overflowX: 'hidden' }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        @media (min-width: 1024px) {
          main {
            margin-left: 260px !important;
          }
          .mobileMenuBtn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
