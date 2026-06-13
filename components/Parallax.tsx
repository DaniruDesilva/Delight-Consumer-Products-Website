'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ParallaxProps {
  children: ReactNode;
  speed?: number; // 0.1 = very subtle, 0.5 = noticeable, 1.0 = strong
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function Parallax({
  children,
  speed = 0.3,
  className,
  style,
  disabled = false,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const ticking = useRef(false);

  useEffect(() => {
    // Disable parallax on mobile for performance, or if user prefers reduced motion
    const isMobile = window.innerWidth < 768;
    if (disabled || prefersReducedMotion || isMobile) return;

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Only calculate when element is in viewport
            if (rect.bottom > 0 && rect.top < windowHeight) {
              const elementCenter = rect.top + rect.height / 2;
              const viewportCenter = windowHeight / 2;
              const distance = elementCenter - viewportCenter;
              setOffset(distance * speed * -0.15);
            }
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, disabled, prefersReducedMotion]);

  const shouldAnimate = !disabled && !prefersReducedMotion;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: shouldAnimate ? `translate3d(0, ${offset}px, 0)` : undefined,
        willChange: shouldAnimate ? 'transform' : undefined,
        transition: 'transform 0.1s linear',
      }}
    >
      {children}
    </div>
  );
}
