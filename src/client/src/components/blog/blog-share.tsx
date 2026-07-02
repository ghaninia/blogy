'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLinkIcon } from '@/components/icons/external-link-icon';
import { buildShareLinks } from '@/lib/share';
import { cn, titleFont } from '@/lib/utils';

const PLATFORMS = [
  { key: 'twitter', label: 'X', hrefKey: 'twitter' as const },
  { key: 'linkedin', label: 'LinkedIn', hrefKey: 'linkedin' as const },
  { key: 'telegram', label: 'Telegram', hrefKey: 'telegram' as const },
  { key: 'whatsapp', label: 'WhatsApp', hrefKey: 'whatsapp' as const },
];

export function BlogShare({
  url,
  title,
  locale,
}: {
  url: string;
  title: string;
  locale: string;
}) {
  const t = useTranslations('blog');
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, title);
  const isFa = locale === 'fa';

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [url]);

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className={titleFont(locale, 'mb-4 text-sm font-medium leading-tight text-foreground')}>
        {t('share')}
      </h2>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <a
            key={platform.key}
            href={links[platform.hrefKey]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('shareOn', { platform: platform.label })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-foreground hover:text-background',
              isFa && 'font-fa',
            )}
          >
            {platform.label}
            <ExternalLinkIcon className="h-3 w-3 shrink-0" />
          </a>
        ))}
        <button
          type="button"
          onClick={() => void copyLink()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/60 hover:text-foreground',
            isFa && 'font-fa',
          )}
        >
          {copied ? t('linkCopied') : t('copyLink')}
        </button>
      </div>
    </section>
  );
}
