'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/page.module.css';

interface PopupSettings {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  delaySeconds: number;
}

interface PopupModalProps {
  popup: PopupSettings;
  onDismiss: () => void;
}

export default function PopupModal({ popup, onDismiss }: PopupModalProps) {
  return (
    <AnimatePresence>
      <div className={styles.popupOverlay} onClick={onDismiss}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={styles.popupModal}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.popupClose} onClick={onDismiss} aria-label="Close promotion popup">
            <X size={24} />
          </button>
          {popup.image && (
            <div className={styles.popupImage}>
              <Image
                src={popup.image}
                alt={popup.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 600px) 100vw, 300px"
                priority
              />
            </div>
          )}
          <div className={styles.popupContent}>
            <h2>{popup.title}</h2>
            <p>{popup.description}</p>
            <Link href={popup.link} className={styles.popupBtn} onClick={onDismiss}>
              {popup.linkText}
            </Link>
            <button className={styles.popupDismissText} onClick={onDismiss}>
              No thanks, I&apos;ll pass
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
