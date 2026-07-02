'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations('common');

  const switchPath = (nextLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    return segments.join('/') || `/${nextLocale}`;
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center rounded-full bg-muted/60 p-0.5',
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
            aria-current={selected ? 'page' : undefined}
            className={cn(
              'relative inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-full px-2.5 text-xs font-medium uppercase transition-colors',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected ? (
              <motion.span
                layoutId="locale-switcher-indicator"
                className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border/60"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            ) : null}
            <span className="relative z-10">{loc}</span>
          </Link>
        );
      })}
    </div>
  );
}
