'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Settings2, FileText } from 'lucide-react';
import styles from '../../shared.module.css';

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    title: '',
    department: 'Production',
    location: 'Balapitiya',
    type: 'Full-time',
    description: '',
    requirements: '',
    benefits: '',
    status: 'open',
    form_config: {
      requirePhone: true,
      requireCV: true,
      requireCoverLetter: false,
      customQuestions: [] as { label: string; type: string }[]
    }
  });

  const categories = ['Production', 'Sales', 'Administration', 'Marketing', 'Logistics'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const addQuestion = () => {
    const newQuestions = [...formData.form_config.customQuestions, { label: '', type: 'text' }];
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.form_config.customQuestions.filter((_, i) => i !== index);
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = formData.form_config.customQuestions.map((q, i) => i === index ? { ...q, [field]: value } : q);
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        form_config_json: JSON.stringify(formData.form_config)
      };
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) router.push('/admin/jobs');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/jobs" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Create Job Posting</h1>
            <p>Define role and customize application form</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs} style={{ marginBottom: '24px' }}>
        <button className={activeTab === 'general' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('general')}>
          General Information
        </button>
        <button className={activeTab === 'form' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('form')}>
          Application Form Builder
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.cardBody}>
          {activeTab === 'general' ? (
            <div className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label>Job Title</label>
                <input type="text" required className={styles.input} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Senior Production Supervisor" />
              </div>
              <div className={styles.formGroup}>
                <label>Department</label>
                <select className={styles.input} value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Job Type</label>
                <select className={styles.input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label>Description (Markdown supported)</label>
                <textarea required className={styles.textarea} rows={6} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Requirements</label>
                <textarea className={styles.textarea} rows={4} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="One per line..." />
              </div>
              <div className={styles.formGroup}>
                <label>Benefits</label>
                <textarea className={styles.textarea} rows={4} value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} placeholder="One per line..." />
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '700px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Standard Fields</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.form_config.requirePhone} onChange={e => setFormData({ ...formData, form_config: { ...formData.form_config, requirePhone: e.target.checked } })} />
                  <span>Require Phone Number</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.form_config.requireCV} onChange={e => setFormData({ ...formData, form_config: { ...formData.form_config, requireCV: e.target.checked } })} />
                  <span>Require CV / Resume Upload (PDF)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.form_config.requireCoverLetter} onChange={e => setFormData({ ...formData, form_config: { ...formData.form_config, requireCoverLetter: e.target.checked } })} />
                  <span>Require Cover Letter / Message</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px' }}>Custom Questions</h3>
                <button type="button" onClick={addQuestion} className={styles.btnSecondary} style={{ fontSize: '13px' }}>
                  <Plus size={16} /> Add Question
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.form_config.customQuestions.map((q, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Question Label</label>
                      <input type="text" className={styles.input} value={q.label} onChange={e => updateQuestion(idx, 'label', e.target.value)} placeholder="e.g., Expected Salary" />
                    </div>
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Type</label>
                      <select className={styles.input} value={q.type} onChange={e => updateQuestion(idx, 'type', e.target.value)}>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => removeQuestion(idx)} style={{ marginTop: '24px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {formData.form_config.customQuestions.length === 0 && (
                   <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No custom questions added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/jobs" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
