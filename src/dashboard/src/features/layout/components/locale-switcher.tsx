'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/shared/i18n/request';
import { cn } from '@/shared/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations('nav');

  const switchPath = (nextLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    return segments.join('/') || `/${nextLocale}`;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-glass-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label={t('language')}
    >
      {locales.map((loc) => {
        const selected = locale === loc;

        return (
          <Link
            key={loc}
            href={switchPath(loc)}
            aria-label={loc === 'fa' ? t('persian') : t('english')}
            aria-current={selected ? 'true' : undefined}
            className={cn(
              'inline-flex h-8 min-w-[2.75rem] items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition-all duration-150',
              selected
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                : 'text-muted-foreground hover:bg-background/40 hover:text-foreground',
            )}
          >
            {loc}
          </Link>
        );
      })}
    </div>
  );
}
