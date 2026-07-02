'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/motion/text-effect';
import type { ExperienceItem } from '@/lib/data';
import { cn, formatYear, getLocalizedField, titleFont } from '@/lib/utils';

function ExperienceCard({
  active,
  onEnter,
  onLeave,
  children,
}: {
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="group relative rounded-xl"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {active ? (
        <motion.span
          layoutId="experience-card-highlight"
          className="pointer-events-none absolute inset-0 rounded-xl border border-foreground/30 bg-muted/40 shadow-sm"
          transition={{ type: 'spring', bounce: 0.12, duration: 0.42 }}
        />
      ) : null}
      <div
        className={cn(
          'relative flex flex-col gap-1 rounded-xl border border-border bg-muted/20 px-4 py-3 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between',
          'group-hover:border-foreground/20 group-hover:bg-muted/35',
          active && 'border-transparent bg-transparent',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ExperienceSection({
  items,
  locale,
  title,
  presentLabel,
}: {
  items: ExperienceItem[];
  locale: string;
  title: string;
  presentLabel: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <FadeIn className="py-10">
      <h2 className={titleFont(locale, 'mb-5 text-sm font-medium text-foreground')}>{title}</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const jobTitle = getLocalizedField(item, 'title', locale);
          const company = getLocalizedField(item, 'company', locale);
          const start = formatYear(item.startDate, locale);
          const end = item.endDate ? formatYear(item.endDate, locale) : presentLabel;

          return (
            <ExperienceCard
              key={item.id}
              active={activeId === item.id}
              onEnter={() => setActiveId(item.id)}
              onLeave={() => setActiveId(null)}
            >
              <div>
                  <p className={titleFont(locale, 'font-medium')}>{jobTitle}</p>
                <p className={cn('text-sm text-muted-foreground', locale === 'fa' && 'font-fa')}>
                  {company}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {start} — {end}
              </p>
            </ExperienceCard>
          );
        })}
      </div>
    </FadeIn>
  );
}
