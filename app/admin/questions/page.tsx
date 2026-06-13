'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import styles from '../shared.module.css';

interface Question {
  id: number; product_name: string; user_name: string;
  question: string; answer: string; answered_at: string | null; created_at: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'unanswered'>('unanswered');
  const [answerText, setAnswerText] = useState<Record<number, string>>({});

  const load = () => {
    fetch('/api/admin/questions').then(r => r.json()).then(d => setQuestions(d.questions || []));
  };

  useEffect(() => { load(); }, []);

  const handleAnswer = async (id: number) => {
    const answer = answerText[id];
    if (!answer?.trim()) return;
    await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, answer }),
    });
    setAnswerText({ ...answerText, [id]: '' });
    load();
  };

  const filtered = filter === 'unanswered'
    ? questions.filter(q => !q.answer)
    : questions;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Customer Questions</h1>
          <p>{questions.filter(q => !q.answer).length} unanswered questions</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`${styles.filterTag} ${filter === 'unanswered' ? styles.filterActive : ''}`} onClick={() => setFilter('unanswered')}>
            Unanswered
          </button>
          <button className={`${styles.filterTag} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>
            All Questions
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className={styles.card}>
            <div className={styles.emptyState}>
              <CheckCircle size={40} strokeWidth={1} />
              <h3>All caught up!</h3>
              <p>No unanswered questions</p>
            </div>
          </div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className={styles.card}>
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong style={{ color: '#1a1d23', fontSize: 14 }}>{q.product_name}</strong>
                    <span style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>by {q.user_name} · {new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  {q.answer ? (
                    <span className={`${styles.badge} ${styles.delivered}`}>Answered</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.pending}`}>Pending</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: q.answer ? 0 : 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>Q</div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{q.question}</p>
                </div>

                {q.answer ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#f9fafb', padding: 14, borderRadius: 10, marginTop: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>A</div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{q.answer}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <MessageCircle size={18} color="#9ca3af" />
                    <input
                      value={answerText[q.id] || ''}
                      onChange={e => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                      placeholder="Type your answer..."
                      className={styles.searchInput}
                      style={{ flex: 1 }}
                      onKeyDown={e => e.key === 'Enter' && handleAnswer(q.id)}
                    />
                    <button onClick={() => handleAnswer(q.id)} className={styles.primaryBtn} style={{ padding: '10px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Send size={16} /> Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
