'use client';

import { TextEffect } from '@/components/motion/text-effect';
import { titleFont } from '@/lib/utils';

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
            'text-xl font-medium tracking-tight text-foreground sm:text-2xl',
          )}
        >
          {name}
        </TextEffect>
        {subtitle ? (
          <TextEffect
            as="p"
            delay={0.06}
            className="text-base font-normal tracking-tight text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </TextEffect>
        ) : null}
      </div>
      {description ? (
        <TextEffect
          as="p"
          delay={0.12}
          className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-[0.9375rem]"
        >
          {description}
        </TextEffect>
      ) : null}
    </section>
  );
}
