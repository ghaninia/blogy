'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { getMediaUrl } from '@/shared/api-client';
import { useSiteSettings } from '@/shared/hooks/use-site-settings';

interface SiteBrandProps {
  href?: string;
  className?: string;
  showName?: boolean;
  imageClassName?: string;
}

export function SiteBrand({
  href,
  className,
  showName = true,
  imageClassName = 'h-8 w-auto max-w-[9rem]',
}: SiteBrandProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const { config } = useSiteSettings();

  const name = config.name || t('title');
  const logoUrl = config.logoPath ? getMediaUrl(config.logoPath) : '';

  const content = (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={144}
          height={36}
          className={cn('shrink-0 object-contain object-left', imageClassName)}
          unoptimized
          priority
        />
      ) : null}
      {showName ? (
        <span className={cn('truncate font-bold text-primary', logoUrl ? 'text-base' : 'text-lg', locale === 'fa' && 'font-fa')}>
          {name}
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="min-w-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
