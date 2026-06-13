'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;   // Optional: start scale (e.g. 0.95)
  rotate?: number;  // Optional: start rotation in degrees
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 40,
  scale,
  rotate,
  className,
}: ScrollRevealProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Respect user's OS-level "Reduce Motion" preference (accessibility + perf)
  const prefersReducedMotion = useReducedMotion();

  // Build initial/animate states dynamically
  const initial: Record<string, number> = { opacity: 0, y };
  const animate: Record<string, number> = { opacity: 1, y: 0 };

  if (scale !== undefined) {
    initial.scale = scale;
    animate.scale = 1;
  }
  if (rotate !== undefined) {
    initial.rotate = rotate;
    animate.rotate = 0;
  }

  // SSR & pre-hydration state: Render static initial state to avoid any mismatch
  if (!mounted) {
    return (
      <div 
        className={className} 
        style={{ 
          opacity: 0, 
          transform: `translateY(${y}px)${scale !== undefined ? ` scale(${scale})` : ''}${rotate !== undefined ? ` rotate(${rotate}deg)` : ''}` 
        }}
      >
        {children}
      </div>
    );
  }

  if (prefersReducedMotion) {
    // Skip animation entirely for users who prefer reduced motion
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
