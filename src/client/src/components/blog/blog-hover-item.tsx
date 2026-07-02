'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const highlightSpring = { type: 'spring' as const, bounce: 0.12, duration: 0.42 };

export function BlogHoverItem({
  active,
  onEnter,
  href,
  layoutId,
  className,
  children,
}: {
  active: boolean;
  onEnter: () => void;
  href: string;
  layoutId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('relative rounded-lg px-2 py-3', className)} onMouseEnter={onEnter}>
      {active ? (
        <motion.span
          layoutId={layoutId}
          className="pointer-events-none absolute inset-0 rounded-lg border border-foreground/10 bg-gradient-to-b from-muted/90 to-muted/50 shadow-sm"
          transition={highlightSpring}
        />
      ) : null}
      <Link
        href={href}
        className={cn(
          'relative block transition-colors',
          active ? 'text-foreground' : 'text-foreground/90',
        )}
      >
        {children}
      </Link>
    </div>
  );
}
