'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);
      setTimeout(() => {
        router.push('/?login=true');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Invalid or missing reset token.</p>
        <Link href="/forgot-password" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Request a new one</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '15px' }}>
          Password successfully reset!
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>New Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}
          placeholder="Strong password required"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>Confirm New Password</label>
        <input 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}
          placeholder="Confirm password"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '8px' }}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
      <div style={{ background: 'var(--bg-elevated)', padding: '40px', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '24px' }}>Set New Password</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Please enter your new password below.
        </p>

        <Suspense fallback={<p>Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
