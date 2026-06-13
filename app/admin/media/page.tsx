'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import styles from '../shared.module.css';

interface MediaItem {
  id: number; filename: string; original_name: string;
  file_path: string; file_size: number; mime_type: string; uploaded_at: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadMedia = () => {
    fetch('/api/admin/media').then(r => r.json()).then(d => setMedia(d.media || []));
  };

  useEffect(loadMedia, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      await fetch('/api/admin/upload', { method: 'POST', body: fd });
    }
    setToast('Files uploaded!');
    setTimeout(() => setToast(''), 3000);
    setUploading(false);
    loadMedia();
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this file?')) return;
    await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setToast('File deleted');
    setTimeout(() => setToast(''), 3000);
    loadMedia();
  };

  const handleCopy = (path: string, id: number) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Media Library</h1>
          <p>{media.length} files uploaded</p>
        </div>
        <label className={styles.btnPrimary} style={{ cursor: 'pointer' }}>
          <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Files'}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {media.map(item => (
          <div key={item.id} className={styles.card} style={{ overflow: 'hidden' }}>
            <div style={{ height: 160, position: 'relative', background: '#f3f4f6' }}>
              <Image src={item.file_path} alt={item.original_name} fill style={{ objectFit: 'cover' }} sizes="200px" />
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{item.original_name}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{formatSize(item.file_size)}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 11, flex: 1 }} onClick={() => handleCopy(item.file_path, item.id)}>
                  {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                  {copiedId === item.id ? 'Copied' : 'Copy'}
                </button>
                <button className={styles.btnDanger} style={{ padding: '5px 10px' }} onClick={() => handleDelete(item.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && !uploading && (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <h3>No media files</h3>
            <p>Upload images to use across your website</p>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.success}`}>{toast}</div>}
    </div>
  );
}
