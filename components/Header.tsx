'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, LogOut, Package, Heart, Settings, Search, ChevronDown, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AuthModal from './AuthModal';
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count, user, logout, isAuthOpen, setAuthOpen } = useCart();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<{ contact_phone?: string; whatsapp?: string }>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings); })
      .catch(() => {});
  }, []);

  const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.996 2C6.471 2 1.996 6.476 1.996 12C1.996 13.911 2.531 15.694 3.454 17.202L2 22.5L7.424 21.077C8.868 21.848 10.384 22.25 11.996 22.25C17.52 22.25 21.996 17.775 21.996 12.25C21.996 6.725 17.52 2 11.996 2ZM17.439 16.51C17.21 17.155 16.297 17.72 15.617 17.848C15.151 17.935 14.475 18.016 11.583 16.81C7.882 15.267 5.485 11.503 5.313 11.274C5.141 11.045 3.864 9.356 3.864 7.608C3.864 5.86 4.743 5.006 5.086 4.662C5.43 4.318 5.888 4.204 6.346 4.204C6.489 4.204 6.632 4.218 6.746 4.232C7.09 4.289 7.262 4.332 7.491 4.876C7.777 5.549 8.478 7.254 8.564 7.426C8.65 7.598 8.736 7.827 8.621 8.056C8.506 8.285 8.421 8.385 8.249 8.586C8.077 8.786 7.919 8.944 7.733 9.173C7.561 9.373 7.375 9.588 7.59 9.96C7.805 10.332 8.535 11.521 9.624 12.495C11.026 13.748 12.158 14.135 12.559 14.306C12.959 14.478 13.36 14.435 13.618 14.163C13.876 13.89 14.621 12.988 14.879 12.602C15.136 12.215 15.394 12.273 15.752 12.401C16.11 12.53 18.015 13.475 18.387 13.661C18.76 13.847 19.003 13.933 19.089 14.09C19.175 14.248 19.175 14.993 18.946 15.638L17.439 16.51Z" />
    </svg>
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/shop', label: 'SHOP' },
    { href: '/about', label: 'ABOUT' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.compact : ''}`}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <div className={styles.topBarLeft}>PREMIUM QUALITY GUARANTEED</div>
            <div className={styles.topBarRight}>
              {settings.contact_phone && (
                <div className={styles.topBarItem}>
                  <Phone size={14} /> {settings.contact_phone}
                </div>
              )}
              {settings.whatsapp && (
                <div className={styles.topBarItem}>
                  <WhatsAppIcon size={14} /> {settings.whatsapp}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`container ${styles.headerInner}`}>
          {/* LOGO */}
          <Link href="/" className={styles.logo}>
            <Image src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png" alt="Delight" width={220} height={75} className={styles.logoImg} priority />
          </Link>

          {/* DESKTOP NAV */}
          <nav className={styles.navMenu}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.rightSection}>
            <div className={styles.actionRow}>
              <div className={styles.userMenuWrap} ref={dropdownRef}>
                {user ? (
                  <button className={styles.accountBtn} onClick={() => setUserMenu(!userMenu)}>
                    <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                    <div className={styles.accountText}>
                      <span className={styles.accountName}>{user.name.split(' ')[0]}</span>
                      <span className={styles.accountEmail}>{user.email}</span>
                    </div>
                    <ChevronDown size={14} className={styles.chevron} />
                  </button>
                ) : (
                  <button className={styles.loginBtn} onClick={() => setAuthOpen(true)}>
                    <User size={20} strokeWidth={1.8} />
                    <div className={styles.accountText}>
                      <span className={styles.accountName}>SIGN IN</span>
                      <span className={styles.accountEmail}>Account</span>
                    </div>
                  </button>
                )}

                {/* Single Dropdown Instance */}
                {userMenu && user && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link href="/account?tab=dashboard" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                      <User size={16} /> My Dashboard
                    </Link>
                    <Link href="/account?tab=orders" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    <Link href="/account?tab=wishlist" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link href="/account?tab=profile" className={styles.dropdownItem} onClick={() => setUserMenu(false)}>
                      <Settings size={16} /> Profile
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className={styles.cartBtn}>
                <ShoppingCart size={22} strokeWidth={1.8} />
                {count > 0 && <span className={styles.cartCount}>{count}</span>}
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button className={styles.mobileMenuToggle} onClick={() => setMobileOpen(true)}>
                <Menu size={26} strokeWidth={1.5} />
              </button>
            </div>

            {/* Full Search Bar (visible before scroll) */}
            <form className={styles.fullSearchBar} onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
              <button type="submit"><Search size={16} strokeWidth={2} /></button>
            </form>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE SIDENAV ═══ */}
      <nav className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ''}`}>
        <div className={styles.mobileNavHeader}>
          <Image src="https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png" alt="Delight" width={160} height={55} priority />
          <button className={styles.closeBtn} onClick={() => setMobileOpen(false)}><X size={24} /></button>
        </div>
        <div className={styles.mobileLinks}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
        <form onSubmit={handleSearch} className={styles.mobileSearch}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </form>
      </nav>
      {mobileOpen && <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />}

      <AuthModal open={isAuthOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
