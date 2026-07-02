'use client';

import { Container } from '@/components/layout/container';
import { FooterTextSlider } from '@/components/layout/footer-text-slider';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteFooter({ name, year }: { name: string; year: number }) {
  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FooterTextSlider name={name} year={year} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
