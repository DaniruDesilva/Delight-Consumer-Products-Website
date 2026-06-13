'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Briefcase, MapPin, Users } from 'lucide-react';
import styles from '../shared.module.css';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  created_at: string;
}

export default function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [toast, setToast] = useState('');

  const loadJobs = () => {
    fetch('/api/admin/jobs')
      .then(r => r.json())
      .then(data => setJobs(data.jobs || []));
  };

  useEffect(() => { loadJobs(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    const res = await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setToast('Job deleted successfully');
      setTimeout(() => setToast(''), 3000);
      loadJobs();
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Careers & Jobs</h1>
          <p>Post and manage job opportunities at Delight</p>
        </div>
        <Link href="/admin/jobs/new" className={styles.btnPrimary}>
          <Plus size={18} /> New Job Post
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Dept & Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1d23' }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Posted on {new Date(job.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 14 }}>{job.department}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{job.type}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                      <MapPin size={14} color="#9ca3af" />
                      {job.location}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${job.status === 'open' ? styles.active : styles.pending}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/admin/jobs/${job.id}`} className={styles.btnSecondary} style={{ padding: '6px 12px' }}>
                        <Pencil size={14} />
                      </Link>
                      <button className={styles.btnDanger} onClick={() => handleDelete(job.id)} style={{ padding: '6px 12px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <Briefcase size={48} color="#e5e7eb" style={{ marginBottom: 16 }} />
                      <h3>No job postings found</h3>
                      <p>Start by creating your first career opportunity.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
