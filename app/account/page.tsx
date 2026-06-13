'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Heart, User, LogOut, Settings, ShoppingBag, Trash2, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './account.module.css';

interface Order {
  id: number; order_number: string; total: number; status: string;
  items_json: string; created_at: string; shipping_address: string; shipping_city: string;
}
interface Return {
  id: number; order_id: number; order_number: string; reason: string; details: string; status: string; created_at: string; image_url?: string;
}

interface WishlistItem {
  product_id: number; name: string; price: number; original_price: number | null;
  image: string; category: string;
}

function AccountContent() {
  const { user, logout } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'dashboard' | 'orders' | 'wishlist' | 'profile' | null;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'wishlist' | 'profile'>(tabParam || 'dashboard');

  useEffect(() => {
    if (tabParam === 'dashboard' || tabParam === 'orders' || tabParam === 'wishlist' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState(false);
  const [showPassCurrent, setShowPassCurrent] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name, email: user.email, phone: user.phone || '' });
    fetch('/api/user/orders').then(r => r.json()).then(d => {
      setOrders(d.orders || []);
      setReturns(d.returns || []);
    });
    fetch('/api/wishlist').then(r => r.json()).then(d => setWishlist(d.items || []));
  }, [user]);

  if (!user) {
    return (
      <div className={styles.accountPage}>
        <div className={`container ${styles.loginPrompt}`}>
          <User size={48} strokeWidth={1} color="#d1d5db" />
          <h2>Please sign in</h2>
          <p>Click the user icon in the navbar to login or create an account</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const removeFromWishlist = async (productId: number) => {
    await fetch('/api/wishlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    setWishlist(wishlist.filter(w => w.product_id !== productId));
  };

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', processing: '#3b82f6', shipped: '#6366f1',
    delivered: '#10b981', cancelled: '#ef4444',
  };

  const handlePasswordChange = async () => {
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      setPassMsg('All fields are required');
      setPassError(true);
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassMsg('Passwords do not match');
      setPassError(true);
      return;
    }
    if (passForm.new.length < 6) {
      setPassMsg('Password must be at least 6 characters');
      setPassError(true);
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg('Password updated successfully!');
        setPassError(false);
        setPassForm({ current: '', new: '', confirm: '' });
      } else {
        setPassMsg(data.error || 'Failed to update password');
        setPassError(true);
      }
    } catch {
      setPassMsg('An error occurred. Please try again.');
      setPassError(true);
    }
    setTimeout(() => setPassMsg(''), 3000);
  };

  const tabs = [
    { key: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', count: null },
    { key: 'orders' as const, icon: Package, label: 'My Orders', count: orders.length },
    { key: 'wishlist' as const, icon: Heart, label: 'Wishlist', count: wishlist.length },
    { key: 'profile' as const, icon: Settings, label: 'Profile', count: null },
  ];

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.pageGrid}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            <nav className={styles.sideNav}>
              {tabs.map(tab => (
                <button key={tab.key} className={`${styles.sideLink} ${activeTab === tab.key ? styles.sideLinkActive : ''}`} onClick={() => setActiveTab(tab.key)}>
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== null && <span className={styles.tabCount}>{tab.count}</span>}
                </button>
              ))}
              <button className={styles.sideLink} onClick={handleLogout}>
                <LogOut size={18} /> <span>Logout</span>
              </button>
            </nav>

            <div className={styles.mobileNavSelectWrap}>
              <select 
                className={styles.mobileNavSelect} 
                value={activeTab} 
                onChange={(e) => {
                    if (e.target.value === 'logout') {
                      handleLogout();
                    } else {
                      setActiveTab(e.target.value as 'dashboard' | 'orders' | 'wishlist' | 'profile');
                    }
                }}
              >
                <option value="dashboard">Dashboard</option>
                <option value="orders">My Orders {orders.length > 0 ? `(${orders.length})` : ''}</option>
                <option value="wishlist">Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}</option>
                <option value="profile">Profile</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className={styles.mainCol}>
            {/* ─── Dashboard Tab ─── */}
            {activeTab === 'dashboard' && (
              <>
                <h1>Dashboard</h1>
                <div className={styles.profileSection}>
                  <div className={styles.profileFormCard}>
                    <h3>Account Summary</h3>
                    <div className={styles.summaryStats}>
                      <div className={styles.summaryStat}>
                        <span className={styles.summaryNum}>{orders.length}</span>
                        <span className={styles.summaryLabel}>Total Orders</span>
                      </div>
                      <div className={styles.summaryStat}>
                        <span className={styles.summaryNum}>{wishlist.length}</span>
                        <span className={styles.summaryLabel}>Wishlist Items</span>
                      </div>
                      <div className={styles.summaryStat}>
                        <span className={styles.summaryNum}>Rs. {orders.reduce((s, o) => s + o.total, 0).toLocaleString()}</span>
                        <span className={styles.summaryLabel}>Total Spent</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.profileFormCard}>
                    <h3>Welcome back, {user.name.split(' ')[0]}!</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                      From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button className={styles.shopBtn} onClick={() => setActiveTab('orders')} style={{ border: 'none', cursor: 'pointer' }}>View Orders</button>
                      <button className={styles.shopBtn} onClick={() => setActiveTab('profile')} style={{ background: '#f3f4f6', color: '#1a1d23', border: 'none', cursor: 'pointer' }}>Edit Profile</button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* ─── Orders Tab ─── */}
            {activeTab === 'orders' && (
              <>
                <h1>My Orders</h1>
                {orders.length === 0 ? (
                  <div className={styles.empty}>
                    <Package size={48} strokeWidth={1} color="#d1d5db" />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <Link href="/shop" className={styles.shopBtn}>Browse Products</Link>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {orders.map(order => {
                      const items = (() => { try { return JSON.parse(order.items_json); } catch { return []; } })();
                      return (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderHeader}>
                            <div>
                              <span className={styles.orderNum}>{order.order_number}</span>
                              <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <span className={styles.statusBadge} style={{ background: `${statusColor[order.status]}20`, color: statusColor[order.status] }}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          
                          {returns.filter(r => r.order_id === order.id).map(ret => (
                            <div key={ret.id} className={styles.returnNotice}>
                              <span className={styles.returnIcon}>🔄</span>
                              <div className={styles.returnInfo}>
                                <strong>Return Requested:</strong> {ret.reason}
                                <span className={styles.returnStatus} data-status={ret.status}>({ret.status})</span>
                              </div>
                            </div>
                          ))}

                          <div className={styles.orderItems}>
                            {items.map((item: { name: string; qty: number; price: number }, i: number) => (
                              <div key={i} className={styles.orderItem}>
                                <span>{item.name} × {item.qty}</span>
                                <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className={styles.orderFooter}>
                            {order.shipping_address && (
                              <span className={styles.shipAddr}>📍 {order.shipping_address}, {order.shipping_city}</span>
                            )}
                            <strong className={styles.orderTotal}>Total: Rs. {order.total.toLocaleString()}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ─── Wishlist Tab ─── */}
            {activeTab === 'wishlist' && (
              <>
                <h1>My Wishlist</h1>
                {wishlist.length === 0 ? (
                  <div className={styles.empty}>
                    <Heart size={48} strokeWidth={1} color="#d1d5db" />
                    <h3>Your wishlist is empty</h3>
                    <p>Save products you love to your wishlist</p>
                    <Link href="/shop" className={styles.shopBtn}>Browse Products</Link>
                  </div>
                ) : (
                  <div className={styles.wishlistGrid}>
                    {wishlist.map(item => (
                      <div key={item.product_id} className={styles.wishlistCard}>
                        <Link href={`/shop/${item.product_id}`} className={styles.wishlistImage}>
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 200px" />
                        </Link>
                        <div className={styles.wishlistInfo}>
                          <span className={styles.wishlistCat}>{item.category}</span>
                          <Link href={`/shop/${item.product_id}`} className={styles.wishlistName}>{item.name}</Link>
                          <div className={styles.wishlistPriceRow}>
                            <span className={styles.wishlistPrice}>Rs. {item.price.toLocaleString()}</span>
                            {item.original_price && <span className={styles.wishlistOldPrice}>Rs. {item.original_price.toLocaleString()}</span>}
                          </div>
                          <div className={styles.wishlistActions}>
                            <Link href={`/shop/${item.product_id}`} className={styles.viewBtn}><ShoppingBag size={14} /> View Product</Link>
                            <button className={styles.removeWishBtn} onClick={() => removeFromWishlist(item.product_id)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── Profile Tab ─── */}
            {activeTab === 'profile' && (
              <>
                <h1>My Profile</h1>
                <div className={styles.profileSection}>
                  <div className={styles.profileFormCard}>
                    <h3>Personal Information</h3>
                    <div className={styles.profileFields}>
                      <div className={styles.profileField}>
                        <label>Full Name</label>
                        <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                      </div>
                      <div className={styles.profileField}>
                        <label>Email Address</label>
                        <input value={profileForm.email} disabled />
                        <span className={styles.fieldHint}>Email cannot be changed</span>
                      </div>
                      <div className={styles.profileField}>
                        <label>Phone Number</label>
                        <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                      </div>
                    </div>
                    {profileMsg && <div className={styles.profileMsg}>{profileMsg}</div>}
                    <button className={styles.saveProfileBtn} onClick={async () => {
                      const res = await fetch('/api/user/profile', {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: profileForm.name, phone: profileForm.phone }),
                      });
                      if (res.ok) { setProfileMsg('Profile updated!'); setTimeout(() => setProfileMsg(''), 3000); }
                    }}>Save Changes</button>
                  </div>

                  <div className={styles.profileFormCard}>
                    <h3>Change Password</h3>
                    <div className={styles.profileFields}>
                      <div className={styles.profileField}>
                        <label>Current Password</label>
                        <div className={styles.passwordWrapper}>
                          <input type={showPassCurrent ? "text" : "password"} value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} />
                          <button type="button" className={styles.toggleBtn} onClick={() => setShowPassCurrent(!showPassCurrent)}>
                            {showPassCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className={styles.profileField}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                          <input type={showPassNew ? "text" : "password"} value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} />
                          <button type="button" className={styles.toggleBtn} onClick={() => setShowPassNew(!showPassNew)}>
                            {showPassNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className={styles.profileField}>
                        <label>Confirm New Password</label>
                        <div className={styles.passwordWrapper}>
                          <input type={showPassConfirm ? "text" : "password"} value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} />
                          <button type="button" className={styles.toggleBtn} onClick={() => setShowPassConfirm(!showPassConfirm)}>
                            {showPassConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {passMsg && (
                      <div className={styles.profileMsg} style={{ background: passError ? '#fee2e2' : '#d1fae5', color: passError ? '#991b1b' : '#065f46' }}>
                        {passMsg}
                      </div>
                    )}
                    <button className={styles.saveProfileBtn} onClick={handlePasswordChange}>Update Password</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{paddingTop: '160px', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading account details...</div>}>
      <AccountContent />
    </Suspense>
  );
}
