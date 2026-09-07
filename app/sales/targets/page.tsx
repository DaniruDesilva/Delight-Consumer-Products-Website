'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, Award, DollarSign } from 'lucide-react';

export default function TargetsAndCommissionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales/targets')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your performance data...</div>;
  }

  const { target, stats, commissionTiers, estimatedCommission, currentTier, nextTier, commissionHistory } = data;

  const targetAmount = target?.target_amount || 0;
  const achievedSales = stats?.monthlySales || 0;
  const progressPercent = targetAmount > 0 ? Math.min(100, (achievedSales / targetAmount) * 100) : 0;

  const amountToNextTier = nextTier ? nextTier.min_sales - achievedSales : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Performance Dashboard</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Track your monthly targets and estimated commissions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Target Progress Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Target size={20} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Monthly Target</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>LKR {achievedSales.toLocaleString()}</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Target: LKR {targetAmount.toLocaleString()}</span>
          </div>

          <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ 
              height: '100%', 
              background: progressPercent >= 100 ? '#10b981' : '#2563eb', 
              width: `${progressPercent}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 500 }}>
            <span style={{ color: progressPercent >= 100 ? '#10b981' : '#2563eb' }}>{progressPercent.toFixed(1)}% Achieved</span>
            {progressPercent < 100 && targetAmount > 0 && (
              <span style={{ color: '#64748b' }}>LKR {(targetAmount - achievedSales).toLocaleString()} remaining</span>
            )}
            {progressPercent >= 100 && (
              <span style={{ color: '#10b981' }}>Target Exceeded!</span>
            )}
          </div>
        </div>

        {/* Estimated Commission Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Estimated Commission</h2>
          </div>
          
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
            LKR {estimatedCommission.toLocaleString()}
          </div>

          {currentTier ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569', fontWeight: 500, background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
              <Award size={16} color="#eab308" />
              Current Tier: {currentTier.tier_name} ({currentTier.commission_percent}%)
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              No commission tier reached yet.
            </div>
          )}

          {nextTier && (
            <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} color="#3b82f6" />
              Sell <strong>LKR {amountToNextTier.toLocaleString()}</strong> more to reach {nextTier.tier_name} ({nextTier.commission_percent}%)
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Commission Tiers Reference */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Commission Structure</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commissionTiers.map((tier: any) => (
              <div key={tier.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{tier.tier_name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Min. Sales: LKR {tier.min_sales.toLocaleString()}</div>
                </div>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 600 }}>
                  {tier.commission_percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission History */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Payout History</h2>
          {commissionHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '14px' }}>
              No past commission records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {commissionHistory.map((history: any) => (
                <div key={history.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{history.month}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Sales: LKR {history.total_sales.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '15px' }}>LKR {history.commission_amount.toLocaleString()}</div>
                    <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 600,
                        background: history.status === 'paid' ? '#ecfdf5' : '#fefce8',
                        color: history.status === 'paid' ? '#10b981' : '#ca8a04'
                      }}>
                        {history.status.toUpperCase()}
                      </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
