'use client';

import { TextEffect } from '@/components/motion/text-effect';
import { cn } from '@/lib/utils';

export function IntroSection({ tagline, locale }: { tagline: string; locale: string }) {
  if (!tagline) return null;

  return (
    <section className="py-8">
      <TextEffect
        as="p"
        className={cn(
          'text-base leading-relaxed text-muted-foreground sm:text-lg',
          locale === 'fa' && 'font-fa',
        )}
      >
        {tagline}
      </TextEffect>
    </section>
  );
}
