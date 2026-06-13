'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import styles from '../shared.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [username, setUsername] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => setSettings(d.settings || {}));
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.admin) {
        setUsername(data.admin.username);
        if (data.admin.admin_role === 'super_admin') {
          setIsSuperAdmin(true);
        }
      }
    });
  }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    showToast('Settings saved!');
    setSaving(false);
  };

  const handleSecurityChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password && passwords.new_password !== passwords.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    setSaving(true);

    try {
      const payload: any = { currentPassword: passwords.current_password };
      if (passwords.new_password) payload.newPassword = passwords.new_password;
      if (isSuperAdmin && username) payload.username = username;

      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update security settings');

      showToast('Account updated successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p>Manage site settings and admin account</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left Column */}
        <div>
          {/* Site Settings */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Site Information</h2>
              <button className={styles.btnPrimary} onClick={handleSettingsSave} disabled={saving} style={{ padding: '8px 16px', fontSize: 12 }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className={styles.formGroup}>
                    <label>Website Visibility Status</label>
                    <select
                      value={settings.site_status || 'live'}
                      onChange={e => setSettings({ ...settings, site_status: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    >
                      <option value="live">Live (Normal)</option>
                      <option value="maintenance">Maintenance Mode</option>
                      <option value="coming_soon">Coming Soon Mode</option>
                    </select>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0 0' }}>
                      Change this to instantly block the storefront. Admins can still access the dashboard.
                    </p>
                  </div>
                {[
                  { key: 'site_name', label: 'Site Name' },
                  { key: 'site_tagline', label: 'Tagline' },
                  { key: 'contact_phone', label: 'Phone Number' },
                  { key: 'contact_email', label: 'Email Address' },
                  { key: 'contact_address', label: 'Address' },
                  { key: 'whatsapp', label: 'WhatsApp Number' },
                  { key: 'footer_manifesto', label: 'Footer Manifesto' },
                  { key: 'facebook', label: 'Facebook URL' },
                  { key: 'tiktok', label: 'TikTok URL' },
                  { key: 'youtube', label: 'YouTube URL' },
                ].map(field => (
                  <div key={field.key} className={styles.formGroup}>
                    <label>{field.label}</label>
                    <input value={settings[field.key] || ''} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.cardHeader}>
              <h2>Shipping Settings</h2>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'shipping_flat_rate', label: 'Flat Rate (Rs.)', default: '400' },
                  { key: 'shipping_additional_kg_rate', label: 'Additional per kg rate (Rs.)', default: '150' },
                  { key: 'free_shipping_threshold', label: 'Free Shipping Threshold (Rs.)', default: '5000' },
                ].map(field => (
                  <div key={field.key} className={styles.formGroup}>
                    <label>{field.label}</label>
                    <input className={styles.input} type="number" value={settings[field.key] || ''} placeholder={field.default} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popup Settings */}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.cardHeader}>
              <h2>Promotional Popup</h2>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Enable Popup</label>
                  <select className={styles.input} value={settings.popup_enabled || '0'} onChange={e => setSettings({ ...settings, popup_enabled: e.target.value })}>
                    <option value="1">Enabled</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
                {[
                  { key: 'popup_title', label: 'Title' },
                  { key: 'popup_description', label: 'Description' },
                  { key: 'popup_link', label: 'Button Link' },
                  { key: 'popup_link_text', label: 'Button Text' },
                  { key: 'popup_delay_seconds', label: 'Delay (Seconds)' },
                ].map(field => (
                  <div key={field.key} className={styles.formGroup}>
                    <label>{field.label}</label>
                    <input className={styles.input} value={settings[field.key] || ''} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>Image URL</label>
                  <input className={styles.input} value={settings.popup_image || ''} onChange={e => setSettings({ ...settings, popup_image: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Account & Security */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><h2>Account & Security</h2></div>
            <div className={styles.cardBody}>
              <form onSubmit={handleSecurityChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={!isSuperAdmin}
                    className={styles.input}
                    style={!isSuperAdmin ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' } : {}}
                  />
                  {!isSuperAdmin && <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Only Super Admins can change their username.</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Current Password (Required to update)</label>
                  <input className={styles.input} type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} required />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password (Optional)</label>
                  <input className={styles.input} type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} minLength={6} />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input className={styles.input} type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} minLength={6} />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Updating...' : 'Update Account'}
                </button>
              </form>
            </div>
          </div>

          {/* Bank Transfer Settings */}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.cardHeader}>
              <h2>Bank Transfer Details</h2>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'bank_name', label: 'Bank Name' },
                  { key: 'bank_account_name', label: 'Account Name' },
                  { key: 'bank_account_number', label: 'Account Number' },
                  { key: 'bank_branch', label: 'Branch Name' },
                ].map(field => (
                  <div key={field.key} className={styles.formGroup}>
                    <label>{field.label}</label>
                    <input className={styles.input} value={settings[field.key] || ''} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods Options */}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.cardHeader}>
              <h2>Payment Methods Options</h2>
            </div>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Enable Cash on Delivery (COD)</label>
                  <select className={styles.input} value={settings.payment_cod_enabled || '1'} onChange={e => setSettings({ ...settings, payment_cod_enabled: e.target.value })}>
                    <option value="1">Enabled</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Enable Bank Transfer</label>
                  <select className={styles.input} value={settings.payment_bank_transfer_enabled || '1'} onChange={e => setSettings({ ...settings, payment_bank_transfer_enabled: e.target.value })}>
                    <option value="1">Enabled</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Enable PayHere</label>
                  <select className={styles.input} value={settings.payment_payhere_enabled || '1'} onChange={e => setSettings({ ...settings, payment_payhere_enabled: e.target.value })}>
                    <option value="1">Enabled</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.cardHeader}><h2>About</h2></div>
            <div className={styles.cardBody}>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>
                <p><strong>Delight Admin Dashboard</strong></p>
                <p>Version 1.0.0</p>
                <p>Built with Next.js + SQLite</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast.msg && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}
    </div>
  );
}
