'use client';

import { useEffect } from 'react';
import { useMotionValueEvent, useSpring } from 'framer-motion';
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
  const progress = useSpring(0, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-reading-progress', '');
    root.dataset.readingProgressDir = isRtl ? 'rtl' : 'ltr';

    return () => {
      root.removeAttribute('data-reading-progress');
      delete root.dataset.readingProgressDir;
      root.style.removeProperty('--reading-progress-scale');
      root.style.removeProperty('--reading-progress-opacity');
    };
  }, [isRtl]);

  useMotionValueEvent(progress, 'change', (value) => {
    const root = document.documentElement;
    root.style.setProperty('--reading-progress-scale', String(value));
    root.style.setProperty('--reading-progress-opacity', value > 0.001 ? '1' : '0');
  });

  useEffect(() => {
    const target =
      document.querySelector('[data-reading-article]') ??
      document.querySelector('article') ??
      document.querySelector('main');

    if (!target) return;

    const update = () => {
      progress.set(getScrollProgress(target));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [progress]);

  return null;
}
