'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FileText, Newspaper, Briefcase, ClipboardList, Image, ShoppingCart, Users, MessageCircle, Settings, LogOut, ChevronLeft, Menu, RefreshCcw, Tag, BarChart3, FolderTree } from 'lucide-react';
import styles from './Sidebar.module.css';

const ALL_NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: 'any' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', permission: 'super_admin' },
  { href: '/admin/coupons', icon: Tag, label: 'Promo Coupons', permission: 'manage_orders' },
  { href: '/admin/hero-slides', icon: Image, label: 'Hero Slides', permission: 'manage_content' },
  { href: '/admin/brands', icon: Briefcase, label: 'Brands', permission: 'manage_products' },
  { href: '/admin/product-info', icon: FileText, label: 'Product Info', permission: 'manage_products' },
  { href: '/admin/categories', icon: FolderTree, label: 'Categories', permission: 'manage_products' },
  { href: '/admin/products', icon: Package, label: 'Products', permission: 'manage_products' },
  { href: '/admin/content', icon: FileText, label: 'Content', permission: 'manage_content' },
  { href: '/admin/news', icon: Newspaper, label: 'News', permission: 'manage_content' },
  { href: '/admin/newsletter', icon: MessageCircle, label: 'Newsletter', permission: 'manage_customers' },
  { href: '/admin/jobs', icon: Briefcase, label: 'Careers', permission: 'manage_careers' },
  { href: '/admin/careers/applications', icon: ClipboardList, label: 'Applications', permission: 'manage_careers' },
  { href: '/admin/media', icon: Image, label: 'Media', permission: 'manage_content' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', permission: 'manage_orders' },
  { href: '/admin/returns', icon: RefreshCcw, label: 'Returns', permission: 'manage_orders' },
  { href: '/admin/faq', icon: MessageCircle, label: 'FAQs', permission: 'manage_content' },
  { href: '/admin/customers', icon: Users, label: 'Customers', permission: 'manage_customers' },
  { href: '/admin/questions', icon: MessageCircle, label: 'Questions', permission: 'manage_customers' },
  { href: '/admin/staff', icon: Users, label: 'Staff', permission: 'super_admin' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', permission: 'manage_settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  adminUser?: any;
}

export default function Sidebar({ collapsed, onToggle, onLogout, adminUser }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navItems = ALL_NAV_ITEMS.filter(item => {
    if (item.permission === 'any') return true;
    if (adminUser?.admin_role === 'super_admin') return true;
    const userPerms = Array.isArray(adminUser?.permissions) ? adminUser.permissions : [];
    return userPerms.includes(item.permission);
  });

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.brand}>
          {!collapsed && <span className={styles.brandName}>Delight</span>}
          {!collapsed && <span className={styles.brandSub}>Admin Panel</span>}
          <button className={styles.toggleBtn} onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} strokeWidth={1.8} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={20} strokeWidth={1.8} />
            {!collapsed && <span>Logout</span>}
          </button>
          <Link href="/" className={styles.viewSite} target="_blank">
            {!collapsed && <span>← View Website</span>}
          </Link>
        </div>
      </aside>
      {!collapsed && <div className={styles.overlay} onClick={onToggle} />}
    </>
  );
}
