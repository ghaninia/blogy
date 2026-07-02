'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const variants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)', y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

interface TextEffectProps {
  children: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'span';
  per?: 'word' | 'char';
  delay?: number;
}

export function TextEffect({
  children,
  className,
  as: Tag = 'p',
  per = 'word',
  delay = 0,
}: TextEffectProps) {
  const parts = per === 'word' ? children.split(' ') : children.split('');

  return (
    <Tag className={cn('text-balance', className)}>
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: variants.hidden,
            visible: (index: number) => ({
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              transition: {
                delay: delay + index * 0.04,
                duration: 0.35,
                ease: [0.25, 0.4, 0.25, 1],
              },
            }),
          }}
          className="inline-block"
          style={{ marginInlineEnd: per === 'word' ? '0.28em' : undefined }}
        >
          {part}
          {per === 'word' && i < parts.length - 1 ? '\u00A0' : null}
        </motion.span>
      ))}
    </Tag>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
