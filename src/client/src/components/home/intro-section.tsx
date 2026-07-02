'use client';

import { TextEffect } from '@/components/motion/text-effect';
import { cn } from '@/lib/utils';

export function IntroSection({
  name,
  tagline,
  locale,
}: {
  name: string;
  tagline: string;
  locale: string;
}) {
  return (
    <section className="py-8">
      <TextEffect
        as="h1"
        className={cn(
          'text-base font-medium tracking-tight text-foreground sm:text-lg',
          locale === 'fa' && 'font-fa',
        )}
      >
        {name}
      </TextEffect>
      {tagline ? (
        <TextEffect
          as="p"
          delay={0.08}
          className={cn(
            'mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg',
            locale === 'fa' && 'font-fa',
          )}
        >
          {tagline}
        </TextEffect>
      ) : null}
    </section>
  );
}
