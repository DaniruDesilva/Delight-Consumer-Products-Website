'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle2, Upload, Send, AlertCircle } from 'lucide-react';
import styles from './job-detail.module.css';
import ScrollReveal from '@/components/ScrollReveal';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    cv: null as File | null,
    customAnswers: {} as Record<string, string>
  });

  useEffect(() => {
    fetch(`/api/jobs?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) router.push('/careers');
        else {
          data.form_config = JSON.parse(data.form_config_json || '{}');
          setJob(data);
        }
        setLoading(false);
      });
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cv: e.target.files[0] });
    }
  };

  const handleCustomAnswer = (label: string, value: string) => {
    setFormData({
      ...formData,
      customAnswers: { ...formData.customAnswers, [label]: value }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const body = new FormData();
      body.append('jobId', id as string);
      body.append('name', formData.name);
      body.append('email', formData.email);
      body.append('phone', formData.phone);
      body.append('message', formData.message);
      body.append('customAnswers', JSON.stringify(formData.customAnswers));
      if (formData.cv) body.append('cv', formData.cv);

      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        body
      });

      if (res.ok) setSuccess(true);
      else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '100px 0', textAlign: 'center' }}>Loading job details...</div>;
  if (!job) return null;

  return (
    <div className={styles.detailPage}>
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <Link href="/careers" className={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Careers
          </Link>
          <div className={styles.headerContent}>
             <span className={styles.deptBadge}>{job.department}</span>
             <h1>{job.title}</h1>
             <div className={styles.meta}>
               <span><MapPin size={16} /> {job.location}</span>
               <span><Clock size={16} /> {job.type}</span>
               <span><Briefcase size={16} /> {job.department}</span>
             </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.mainGrid}>
          {/* Content */}
          <main className={styles.content}>
            <ScrollReveal>
              <div className={styles.section}>
                <h2>Role Overview</h2>
                <div className={styles.richText}>{job.description}</div>
              </div>

              {job.requirements && (
                <div className={styles.section}>
                  <h2>Requirements</h2>
                  <ul className={styles.list}>
                    {job.requirements.split('\n').map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && (
                <div className={styles.section}>
                  <h2>Benefits</h2>
                  <ul className={styles.list}>
                    {job.benefits.split('\n').map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </ScrollReveal>
          </main>

          {/* Sidebar / Form */}
          <aside className={styles.sidebar}>
            {success ? (
              <div className={styles.successCard}>
                <CheckCircle2 size={48} color="#059669" />
                <h3>Application Received!</h3>
                <p>Thank you for your interest in joining Delight. Our HR team will review your application and contact you if your profile matches the role.</p>
                <Link href="/careers" className={styles.btnSecondary}>View More Openings</Link>
              </div>
            ) : (
              <div className={styles.formCard}>
                <h3>Apply for this Role</h3>
                <p>Fill in the details below to submit your application.</p>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  {job.form_config.requirePhone && (
                    <div className={styles.formGroup}>
                      <label>Phone Number *</label>
                      <input type="tel" required placeholder="+94 77 XXX XXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  )}

                  {/* Custom Questions */}
                  {job.form_config.customQuestions?.map((q: any, i: number) => (
                    <div key={i} className={styles.formGroup}>
                      <label>{q.label} *</label>
                      <input 
                        type={q.type} 
                        required 
                        value={formData.customAnswers[q.label] || ''} 
                        onChange={e => handleCustomAnswer(q.label, e.target.value)} 
                      />
                    </div>
                  ))}

                  {job.form_config.requireCoverLetter && (
                    <div className={styles.formGroup}>
                      <label>Cover Letter / Message *</label>
                      <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                  )}

                  {job.form_config.requireCV && (
                    <div className={styles.formGroup}>
                      <label>CV / Resume (PDF only) *</label>
                      <div className={styles.fileUpload} onClick={() => fileInputRef.current?.click()}>
                        <Upload size={20} />
                        <span>{formData.cv ? formData.cv.name : 'Upload File'}</span>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} required />
                      </div>
                    </div>
                  )}

                  {error && <div className={styles.error}><AlertCircle size={16} /> {error}</div>}

                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Submitting...' : <><Send size={18} /> Submit Application</>}
                  </button>
                  <p className={styles.disclaimer}>By clicking &quot;Submit Application&quot;, you agree to our Privacy Policy regarding candidate data.</p>
                </form>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
