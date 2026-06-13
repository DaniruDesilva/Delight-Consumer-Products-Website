'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Eye, EyeOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function AuthModal({ open, onClose, redirectTo }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { refreshUser, refreshCart } = useCart();
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    const url = mode === 'login' ? '/api/auth/user/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, phone: form.phone, password: form.password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Sync local cart items to DB
      try {
        const localCart = localStorage.getItem('delight_cart');
        if (localCart) {
          const items = JSON.parse(localCart);
          for (const item of items) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity })
            });
          }
          localStorage.removeItem('delight_cart');
        }
      } catch (e) {
        console.error('Failed to sync local cart', e);
      }

      await refreshUser();
      await refreshCart();
      setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      onClose();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`} onClick={() => { setMode('login'); setError(''); }}>Login</button>
          <button className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
        </div>

        {redirectTo && (
          <div className={styles.redirectHint}>Please sign in to continue</div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            required 
            pattern="^\S+@\S+\.\S+$"
            title="Please enter a valid email address (e.g., user@example.com)"
          />
          {mode === 'signup' && (
            <input 
              type="tel" 
              placeholder="Phone Number (e.g., 0771234567)" 
              value={form.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              required
              pattern="^0[0-9]{9}$"
              title="Mobile number must start with 0 and be exactly 10 digits"
            />
          )}
          <div className={styles.passwordWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
              pattern={mode === 'signup' ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}" : undefined}
              title={mode === 'signup' ? "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character." : undefined}
            />
            <button 
              type="button" 
              className={styles.toggleBtn} 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'signup' && (
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                value={form.confirmPassword} 
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} 
                required 
              />
            </div>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
              <Link href="/forgot-password" onClick={onClose} style={{ fontSize: '13px', color: 'var(--primary-green)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          )}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}>or continue with</div>

        <button 
          className={styles.googleBtn} 
          onClick={() => { window.location.href = '/api/auth/google'; }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className={styles.switchBtn} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
