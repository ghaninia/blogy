'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogTitle } from '@gh/ui';
import { cn } from '@/shared/lib/utils';
import { SiteBrand } from '@/features/layout/components/site-brand';
import { SidebarNavSections } from '@/features/layout/components/sidebar-nav';
import { SidebarUserFooter } from '@/features/layout/components/sidebar-user-footer';
import { useAuthStore } from '@/shared/store/auth';
import { useSiteSettings } from '@/shared/hooks/use-site-settings';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const userRole = useAuthStore((s) => s.user?.role ?? '');
  const { config } = useSiteSettings();

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'glass-strong !fixed !inset-y-0 !start-0 !end-auto !top-0 !left-auto !flex !h-full !w-[min(88vw,17.5rem)] !max-w-none !translate-x-0 !translate-y-0 !flex-col !rounded-none !border-e !p-0 shadow-xl duration-300',
          'data-[state=open]:!translate-x-0 data-[state=closed]:!-translate-x-full rtl:data-[state=closed]:!translate-x-full',
          locale === 'fa' && 'font-fa',
        )}
      >
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>

        <div className="shrink-0 border-b border-glass-border/80 px-4 py-4">
          <SiteBrand href={`/${locale}/dashboard`} />
          {config.subtitle || config.description ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {[config.subtitle, config.description].filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <SidebarNavSections userRole={userRole} onNavigate={close} />
        </div>

        <SidebarUserFooter onNavigate={close} />
      </DialogContent>
    </Dialog>
  );
}
