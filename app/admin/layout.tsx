'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { Menu } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Login page gets no sidebar/topbar and no auth check
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) { setAuthed(true); return; }
    // Check admin session
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.admin) {
        setAdminUser(data.admin);
        setAuthed(true);
      } else {
        router.replace('/admin/login');
      }
    }).catch(() => router.replace('/admin/login'));
  }, [isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  // Show nothing while checking auth
  if (authed === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f5f7', color: '#9ca3af' }}>
        Loading...
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className={styles.adminRoot}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onLogout={handleLogout} adminUser={adminUser} />
      <div className={`${styles.mainArea} ${collapsed ? styles.mainCollapsed : ''}`}>
        <header className={styles.topBar}>
          <button className={styles.mobileMenu} onClick={() => setCollapsed(false)}>
            <Menu size={22} />
          </button>
          <div className={styles.topBarTitle}>
            <h2>Admin Dashboard</h2>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.adminBadge}>
              <span className={styles.adminAvatar}>{adminUser?.username?.[0]?.toUpperCase() || 'A'}</span>
              <span className={styles.adminName}>{adminUser?.username || 'Admin'}</span>
            </div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
