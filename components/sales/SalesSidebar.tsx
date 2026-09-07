'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingCart, 
  Wallet, 
  Target, 
  LogOut,
  MapPin,
  ClipboardList,
  History
} from 'lucide-react';
import Image from 'next/image';
import styles from './SalesSidebar.module.css';

const NAV_ITEMS = [
  { href: '/sales', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/sales/retailers', icon: Store, label: 'My Retailers' },
  { href: '/sales/orders', icon: ShoppingCart, label: 'Sales Orders' },
  { href: '/sales/collections', icon: Wallet, label: 'Collections' },
  { href: '/sales/targets', icon: Target, label: 'My Targets' },
  { href: '/sales/routes', icon: MapPin, label: 'Routes & Visits' },
  { href: '/sales/reports', icon: ClipboardList, label: 'Daily Reports' },
  { href: '/sales/commissions', icon: History, label: 'Commissions' },
];

export default function SalesSidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean, 
  setIsOpen: (v: boolean) => void 
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/sales/logout', { method: 'POST' });
    router.push('/sales/login');
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setIsOpen(false)}
      />
      <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
        <div className={styles.brand}>
          <Image 
            src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png" 
            alt="Delight Sales" 
            width={140} 
            height={46} 
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
        
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
