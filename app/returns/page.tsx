'use client';

import { useState } from 'react';
import { RefreshCcw, ShieldCheck, AlertTriangle, Send } from 'lucide-react';
import styles from './returns.module.css';

export default function ReturnsPage() {
  const [form, setForm] = useState({
    orderNumber: '',
    identifier: '',
    reason: 'Defective/Damaged',
    details: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          imageUrl = uploadData.path;
        }
      }

      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: form.orderNumber,
          identifier: form.identifier,
          reason: form.reason,
          details: form.details,
          image_url: imageUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setForm({ orderNumber: '', identifier: '', reason: 'Defective/Damaged', details: '' });
        setFile(null);
        // Clear file input manually
        const fileInput = document.getElementById('return-image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.returnsPage}>
      <div className="container">
        <div className={styles.returnsHero}>
          <h1>Returns & Exchanges</h1>
          <p>We want you to be 100% satisfied with your aromatic experience. If something isn&apos;t right, let us know within 7 days of delivery.</p>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.infoCol}>
            <div className={styles.policyCard}>
              <h3><ShieldCheck size={20} /> Return Policy</h3>
              <ul>
                <li>Requests must be made within <strong>7 days</strong> of receiving your order.</li>
                <li>Products must be in their original packaging.</li>
                <li>Defective or damaged items will be replaced free of charge.</li>
                <li>For hygiene reasons, some opened aromatic products may not be eligible for return unless defective.</li>
              </ul>
            </div>
            <div className={styles.stepCard}>
              <h3>How it works</h3>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div><strong>Submit Request:</strong> Fill out the form with your order details.</div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div><strong>Review:</strong> Our team will review your request within 48 hours.</div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div><strong>Resolution:</strong> We&apos;ll contact you with instructions for return or replacement.</div>
              </div>
            </div>
          </div>

          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h3>Request a Return</h3>
              <form onSubmit={handleSubmit} className={styles.returnsForm}>
                <div className={styles.inputGroup}>
                  <label>Order Number *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DLT-ABC123" 
                    value={form.orderNumber}
                    onChange={e => setForm({...form, orderNumber: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email or Phone *</label>
                  <input 
                    type="text" 
                    placeholder="Used during checkout" 
                    value={form.identifier}
                    onChange={e => setForm({...form, identifier: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Reason for Return *</label>
                  <select 
                    value={form.reason}
                    onChange={e => setForm({...form, reason: e.target.value})}
                  >
                    <option>Defective/Damaged</option>
                    <option>Wrong Item Received</option>
                    <option>Not as Described</option>
                    <option>Changed My Mind</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Additional Details</label>
                  <textarea 
                    rows={4} 
                    placeholder="Please provide more details about your request..."
                    value={form.details}
                    onChange={e => setForm({...form, details: e.target.value})}
                  ></textarea>
                </div>
                <div className={styles.inputGroup}>
                  <label>Product Image *</label>
                  <input 
                    id="return-image"
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    required
                  />
                  <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>Please upload a clear photo of the product issue.</small>
                </div>

                {message.text && (
                  <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.type === 'error' ? <AlertTriangle size={18} /> : <RefreshCcw size={18} />}
                    {message.text}
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Submitting...' : <><Send size={18} /> Submit Request</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
