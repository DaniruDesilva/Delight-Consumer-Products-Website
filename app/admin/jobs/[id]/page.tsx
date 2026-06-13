'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import styles from '../../shared.module.css';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<any>(null);

  const categories = ['Production', 'Sales', 'Administration', 'Marketing', 'Logistics'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  useEffect(() => {
    fetch('/api/admin/jobs')
      .then(r => r.json())
      .then(data => {
        const found = data.jobs?.find((j: any) => j.id === parseInt(id as string));
        if (found) {
          found.form_config = JSON.parse(found.form_config_json || '{}');
          setFormData(found);
        } else {
          router.push('/admin/jobs');
        }
        setLoading(false);
      });
  }, [id, router]);

  const addQuestion = () => {
    const newQuestions = [...(formData.form_config.customQuestions || []), { label: '', type: 'text' }];
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.form_config.customQuestions.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = formData.form_config.customQuestions.map((q: any, i: number) => i === index ? { ...q, [field]: value } : q);
    setFormData({ ...formData, form_config: { ...formData.form_config, customQuestions: newQuestions } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        form_config_json: JSON.stringify(formData.form_config)
      };
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) router.push('/admin/jobs');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <div style={{ padding: '40px' }}>Loading job details...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/jobs" className={styles.btnSecondary} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Edit Job Posting</h1>
            <p>Modify role details or update the application form</p>
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
                <input type="text" required className={styles.input} value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
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
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.input} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label>Description (Markdown supported)</label>
                <textarea required className={styles.textarea} rows={6} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Requirements</label>
                <textarea className={styles.textarea} rows={4} value={formData.requirements || ''} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Benefits</label>
                <textarea className={styles.textarea} rows={4} value={formData.benefits || ''} onChange={e => setFormData({ ...formData, benefits: e.target.value })} />
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
                {formData.form_config.customQuestions?.map((q: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Question Label</label>
                      <input type="text" className={styles.input} value={q.label || ''} onChange={e => updateQuestion(idx, 'label', e.target.value)} />
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
              </div>
            </div>
          )}
        </div>
        <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/admin/jobs" className={styles.btnSecondary}>Cancel</Link>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
