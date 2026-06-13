'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, ExternalLink, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from '../../shared.module.css';

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  cv_url: string;
  message: string;
  status: string;
  custom_answers_json: string;
  created_at: string;
}

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = () => {
    fetch('/api/admin/applications')
      .then(r => r.json())
      .then(data => {
        setApplications(data.applications || []);
        setLoading(false);
      });
  };

  useEffect(() => { loadApplications(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    loadApplications();
    setSelectedApp(null);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Job Applications</h1>
          <p>Review and manage candidates for open roles</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Desired Role</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1d23' }}>{app.candidate_name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{app.candidate_email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 14 }}>{app.job_title}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                      <Calendar size={14} />
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setSelectedApp(app)} className={styles.btnSecondary} style={{ padding: '6px 12px' }}>
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <h3>No applications yet</h3>
                      <p>Candidates will appear here once they apply for your roles.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className={styles.overlay} onClick={() => setSelectedApp(null)}>
          <div className={`${styles.card} ${styles.modal}`} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Application Details</h2>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            <div className={styles.cardBody}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700 }}>Candidate Info</label>
                    <div style={{ fontWeight: 600, fontSize: '18px', color: '#111827' }}>{selectedApp.candidate_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: '14px', marginTop: 8 }}>
                      <Mail size={14} /> {selectedApp.candidate_email}
                    </div>
                    {selectedApp.candidate_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: '14px', marginTop: 4 }}>
                        <Phone size={14} /> {selectedApp.candidate_phone}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700 }}>Applied For</label>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#3a6b4c', marginTop: 4 }}>{selectedApp.job_title}</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: 2 }}>{new Date(selectedApp.created_at).toLocaleString()}</div>
                  </div>
               </div>

               {selectedApp.cv_url && (
                 <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Candidate Resume</h3>
                    <a href={selectedApp.cv_url} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: 'inline-flex', gap: 8 }}>
                       <ExternalLink size={16} /> View/Download CV
                    </a>
                 </div>
               )}

               {selectedApp.message && (
                 <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Cover Letter / Message</h3>
                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedApp.message}
                    </div>
                 </div>
               )}

               {selectedApp.custom_answers_json && (
                 <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Custom Questions Responses</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(JSON.parse(selectedApp.custom_answers_json)).map(([label, answer]: any) => (
                        <div key={label} style={{ fontSize: '14px' }}>
                          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</div>
                          <div style={{ color: '#4b5563' }}>{answer}</div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
            <div className={styles.cardFooter} style={{ justifyContent: 'flex-end', gap: 12 }}>
               <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className={styles.btnDanger} style={{ display: 'flex', gap: 6 }}>
                 <XCircle size={16} /> Reject
               </button>
               <button onClick={() => updateStatus(selectedApp.id, 'shortlisted')} className={styles.btnSecondary} style={{ display: 'flex', gap: 6 }}>
                 <Clock size={16} /> Shortlist
               </button>
               <button onClick={() => updateStatus(selectedApp.id, 'hired')} className={styles.btnPrimary} style={{ display: 'flex', gap: 6 }}>
                 <CheckCircle size={16} /> Mark as Hired
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
