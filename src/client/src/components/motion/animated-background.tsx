'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className }: AnimatedBackgroundProps) {
  return (
    <div className={cn('group relative', className)}>
      <motion.span
        layoutId="nav-highlight"
        className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-muted opacity-0 transition-opacity group-hover:opacity-100"
        transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
      />
      {children}
    </div>
  );
}

interface AnimatedListItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function AnimatedListItem({ id, children, className, active }: AnimatedListItemProps) {
  return (
    <div className={cn('group relative rounded-lg', className)}>
      {active ? (
        <motion.span
          layoutId="list-highlight"
          className="absolute inset-0 -z-10 rounded-lg bg-muted"
          transition={{ type: 'spring', bounce: 0.12, duration: 0.4 }}
        />
      ) : null}
      <div className="relative transition-colors group-hover:text-foreground">{children}</div>
    </div>
  );
}
