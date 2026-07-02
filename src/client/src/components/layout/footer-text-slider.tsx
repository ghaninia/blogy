'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

export function FooterTextSlider({ lines }: { lines: string[] }) {
  const visibleLines = useMemo(() => lines.filter(Boolean), [lines]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (visibleLines.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % visibleLines.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [visibleLines.length]);

  if (visibleLines.length === 0) return null;

  const activeIndex = visibleLines.length === 1 ? 0 : index;

  return (
    <div className="relative h-5 overflow-hidden text-sm text-muted-foreground">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={activeIndex}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="whitespace-nowrap"
        >
          {visibleLines[activeIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
