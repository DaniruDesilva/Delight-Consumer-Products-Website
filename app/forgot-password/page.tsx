'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

      setMessage('If an account with that email exists, we have sent a password reset link.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
      <div style={{ background: 'var(--bg-elevated)', marginTop: '200px', marginBottom: '50px', padding: '40px', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '24px' }}>Forgot Password</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Enter your email address and we will send you a link to reset your password.
        </p>

        {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{message}</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <Link href="/" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
