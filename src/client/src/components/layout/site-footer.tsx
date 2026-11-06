'use client';

import { Container } from '@/components/layout/container';
import { FooterTextSlider } from '@/components/layout/footer-text-slider';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { resolveFooterTemplate } from '@/lib/site-config';
import type { SiteNavigationItem } from '@/lib/site-config';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { NewsletterSignup } from '@/components/layout/newsletter-signup';

export function SiteFooter({
  name,
  year,
  footerCopyright,
  footerRights,
  locale,
  navigation,
}: {
  name: string;
  year: number;
  footerCopyright: string;
  footerRights: string;
  locale: string;
  navigation: SiteNavigationItem[];
}) {
  const t = useTranslations('nav');
  const lines = [resolveFooterTemplate(footerCopyright, year, name), footerRights];

  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <Container className="mb-8">
        <NewsletterSignup />
      </Container>
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FooterTextSlider lines={lines} />
        <nav className="flex flex-wrap items-center gap-1" aria-label={t('footerNavigation')}>
          {navigation
            .filter((item) => item.enabled)
            .map((item) => {
              const href = /^https?:\/\//i.test(item.href)
                ? item.href
                : `/${locale}${item.href === '/' ? '' : item.href.startsWith('/') ? item.href : `/${item.href}`}`;
              const external = /^https?:\/\//i.test(href);
              return (
                <Link
                  key={item.id}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {locale === 'fa' ? item.labelFa || item.labelEn : item.labelEn || item.labelFa}
                </Link>
              );
            })}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
