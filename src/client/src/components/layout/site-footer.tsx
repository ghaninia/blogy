'use client';

import { Container } from '@/components/layout/container';
import { FooterTextSlider } from '@/components/layout/footer-text-slider';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { resolveFooterTemplate } from '@/lib/site-config';

export function SiteFooter({
  name,
  year,
  footerCopyright,
  footerRights,
}: {
  name: string;
  year: number;
  footerCopyright: string;
  footerRights: string;
}) {
  const lines = [
    resolveFooterTemplate(footerCopyright, year, name),
    footerRights,
  ];

  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FooterTextSlider lines={lines} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
