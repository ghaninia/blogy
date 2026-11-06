import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ExternalLink, Menu } from 'lucide-react';
import type { SiteNavigationItem } from '@/lib/site-config';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export async function SiteHeader({
  name,
  locale,
  items,
}: {
  name: string;
  locale: string;
  items: SiteNavigationItem[];
}) {
  const t = await getTranslations('nav');
  const visibleItems = items.filter((item) => item.enabled);
  const localizedHref = (href: string) =>
    /^https?:\/\//i.test(href)
      ? href
      : `/${locale}${href === '/' ? '' : href.startsWith('/') ? href : `/${href}`}`;

  const renderItem = (item: SiteNavigationItem) => {
    const href = localizedHref(item.href);
    const label = locale === 'fa' ? item.labelFa || item.labelEn : item.labelEn || item.labelFa;
    const external = /^https?:\/\//i.test(href);
    return (
      <Link
        key={item.id}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex items-center gap-1.5">
          {label}
          {external ? <ExternalLink className="h-3 w-3" aria-hidden="true" /> : null}
        </span>
      </Link>
    );
  };

  return (
    <header className="border-b border-border/70 bg-background/90">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href={`/${locale}`}
          className="shrink-0 truncate text-base font-semibold tracking-tight text-foreground"
        >
          {name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t('mainNavigation')}>
          {visibleItems.map(renderItem)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <details className="group relative md:hidden">
            <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-border text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{t('menu')}</span>
              <Menu className="h-4 w-4" aria-hidden="true" />
            </summary>
            <nav
              className="absolute end-0 top-11 z-50 flex min-w-48 flex-col rounded-xl border border-border bg-background p-2 shadow-lg"
              aria-label={t('mainNavigation')}
            >
              {visibleItems.map(renderItem)}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
