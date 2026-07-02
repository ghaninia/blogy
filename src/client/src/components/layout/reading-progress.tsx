'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useLocale } from 'next-intl';

function getScrollProgress(target: Element) {
  const rect = target.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const targetTop = scrollTop + rect.top;
  const targetHeight = target.scrollHeight;
  const viewport = window.innerHeight;

  if (targetHeight <= viewport) return 1;

  const start = targetTop - viewport * 0.15;
  const end = targetTop + targetHeight - viewport * 0.85;
  const range = end - start;

  if (range <= 0) return scrollTop >= end ? 1 : 0;

  return Math.min(1, Math.max(0, (scrollTop - start) / range));
}

export function ReadingProgress() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const [visible, setVisible] = useState(false);
  const progress = useSpring(0, { stiffness: 120, damping: 28, mass: 0.4 });
  const width = useTransform(progress, (v) => `${v * 100}%`);

  useEffect(() => {
    const target =
      document.querySelector('[data-reading-article]') ??
      document.querySelector('article') ??
      document.querySelector('main');

    if (!target) return;

    const update = () => {
      const value = getScrollProgress(target);
      progress.set(value);
      setVisible(value > 0.001);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [progress]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-border/50"
      aria-hidden
    >
      <motion.div
        className="h-full bg-foreground will-change-[width]"
        style={{
          width,
          opacity: visible ? 1 : 0,
          marginInlineStart: isRtl ? 'auto' : undefined,
        }}
        transition={{ opacity: { duration: 0.15 } }}
      />
    </div>
  );
}
