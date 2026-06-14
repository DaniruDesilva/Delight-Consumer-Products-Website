'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './BentoCollections.module.css';

interface Category {
  name: string;
  image: string;
}

interface BentoCollectionsProps {
  categories: Category[];
}

export default function BentoCollections({ categories }: BentoCollectionsProps) {
  // We only show the first 5 categories in the bento grid for the layout design
  const bentoItems = categories.slice(0, 5);

  if (bentoItems.length === 0) return null;

  return (
    <div className={styles.bentoContainer} data-count={bentoItems.length}>
      {bentoItems.map((cat, i) => (
        <Link 
          key={i} 
          href={`/shop?category=${encodeURIComponent(cat.name)}`} 
          className={styles.bentoItem}
        >
          <div className={styles.bentoImage}>
            <Image 
              src={cat.image} 
              alt={cat.name} 
              fill 
              style={{ objectFit: 'cover' }} 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={i < 2 ? "eager" : "lazy"} 
            />
            <div className={styles.bentoOverlay}></div>
          </div>
          <div className={styles.bentoContent}>
            <h3 className={styles.bentoTitle}>{cat.name}</h3>
            <div className={styles.bentoSubtitle}>Explore Collection</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
