'use client';

import { useEffect, useState } from 'react';
import { Tag, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function AvailableCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { applyCoupon, coupon: currentCoupon } = useCart();
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons/active');
        const data = await res.json();
        if (res.ok && data.coupons) {
          setCoupons(data.coupons);
        }
      } catch (err) {
        console.error('Failed to fetch active coupons', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const handleApply = async (code: string) => {
    setApplyingCode(code);
    await applyCoupon(code);
    setApplyingCode(null);
  };

  if (loading || coupons.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Tag size={16} /> Available Offers
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {coupons.map((c) => {
          const isApplied = currentCoupon?.code === c.code;
          return (
            <div 
              key={c.code}
              style={{
                border: '1px dashed var(--primary-green)',
                borderRadius: '8px',
                padding: '12px',
                background: isApplied ? '#f0fdf4' : 'var(--bg-base)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-green)', marginBottom: '4px' }}>
                  {c.code}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {c.discount_type === 'percent' ? `${c.discount_value}% off your order` : 
                   c.discount_type === 'fixed' ? `Rs. ${c.discount_value} off your order` : 'Free shipping on your order'}
                  {c.min_spend > 0 && ` (Min spend: Rs. ${c.min_spend})`}
                </div>
              </div>
              <button
                onClick={() => !isApplied && handleApply(c.code)}
                disabled={isApplied || applyingCode === c.code}
                style={{
                  background: isApplied ? 'transparent' : 'var(--primary-green)',
                  color: isApplied ? 'var(--primary-green)' : '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isApplied ? 'default' : 'pointer',
                  opacity: applyingCode === c.code ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isApplied ? (
                  <><CheckCircle2 size={14} /> Applied</>
                ) : applyingCode === c.code ? (
                  'Applying...'
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
