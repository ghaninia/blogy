'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

export function FooterTextSlider({ name, year }: { name: string; year: number }) {
  const t = useTranslations('footer');
  const lines = useMemo(
    () => [t('copyright', { year, name }), t('rights')],
    [name, t, year],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [lines.length]);

  return (
    <div className="relative h-5 overflow-hidden text-sm text-muted-foreground">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={index}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="whitespace-nowrap"
        >
          {lines[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
