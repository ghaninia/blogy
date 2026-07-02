'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Container } from '@/components/layout/container';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export function SiteHeader({ name }: { name: string }) {
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href={`/${locale}`}
          className={cn(
            'text-sm font-medium tracking-tight text-foreground transition-opacity hover:opacity-70',
            locale === 'fa' && 'font-fa',
          )}
        >
          {name}
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  );
}
