'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(true); // Default true to avoid flash on mobile
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  const mouse = useRef({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only enable on non-touch devices
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Instantly move the dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, textarea, select, [role="button"]');
      
      if (cursorRef.current) {
        if (isClickable) {
          cursorRef.current.classList.add('cursor-hover');
        } else {
          cursorRef.current.classList.remove('cursor-hover');
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    // Smooth follow for the outer ring
    const animate = () => {
      cursor.current.x += (mouse.current.x - cursor.current.x) * 0.15; // Smoothness factor
      cursor.current.y += (mouse.current.y - cursor.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursor.current.x}px, ${cursor.current.y}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isMobile, prefersReducedMotion]);

  // Reset hover state on navigation
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.classList.remove('cursor-hover');
    }
  }, [pathname]);

  if (isMobile || prefersReducedMotion) return null;

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </>
  );
}
