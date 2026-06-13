'use client';

import { motion, useReducedMotion, Variants } from 'framer-motion';
import { useRef } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplitText({ text, className, delay = 0 }: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  // Split text into words, then words into characters, preserving spaces.
  const words = text.split(' ').map(word => word + '\u00A0'); // Add non-breaking space

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', overflow: 'hidden' }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {words.map((word, index) => (
        <span key={index} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={child}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
