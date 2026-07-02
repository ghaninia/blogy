'use client';

import { FadeIn, TextEffect } from '@/components/motion/text-effect';
import { cn, titleFont } from '@/lib/utils';

export function IntroSection({
  name,
  subtitle,
  description,
  locale,
}: {
  name: string;
  subtitle: string;
  description: string;
  locale: string;
}) {
  return (
    <section className="py-8">
      <div className="space-y-0.5">
        <TextEffect
          as="h1"
          className={titleFont(
            locale,
            'text-lg font-medium leading-tight tracking-tight text-foreground sm:text-xl',
          )}
        >
          {name}
        </TextEffect>
        {subtitle ? (
          <TextEffect
            as="p"
            delay={0.06}
            className="text-sm font-normal leading-snug tracking-normal text-muted-foreground sm:text-base"
          >
            {subtitle}
          </TextEffect>
        ) : null}
      </div>
      {description ? (
        <FadeIn delay={0.12}>
          <p
            className={cn(
              'mt-4 max-w-prose text-pretty text-sm leading-[1.6] text-muted-foreground sm:mt-5',
              locale === 'fa' ? 'word-spacing-[0.08em]' : 'word-spacing-[0.04em]',
            )}
          >
            {description}
          </p>
        </FadeIn>
      ) : null}
    </section>
  );
}
