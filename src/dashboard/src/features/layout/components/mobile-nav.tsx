'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@gh/ui';
import { cn } from '@/shared/lib/utils';
import { sidebarItems, sidebarBottomItems } from './sidebar';
import { useAuthStore } from '@/shared/store/auth';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const pathname = usePathname();
  const userRole = useAuthStore((s) => s.user?.role ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'glass-strong !fixed !inset-y-0 !start-0 !end-auto !top-0 !left-auto !h-full !w-72 !max-w-[85vw] !translate-x-0 !translate-y-0 !rounded-none !border-e !p-0 shadow-lg duration-300',
          'data-[state=open]:!translate-x-0 data-[state=closed]:!-translate-x-full rtl:data-[state=closed]:!translate-x-full',
          'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        )}
      >
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <div className="flex items-center gap-2 border-b border-glass-border px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold">{t('title')}</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {[...sidebarItems, ...sidebarBottomItems]
            .filter((item) => (item.roles as readonly string[]).includes(userRole))
            .map((item) => {
              const href = `/${locale}${item.href}`;
              const Icon = item.icon;
              const active =
                'exact' in item && item.exact
                  ? pathname === href
                  : pathname.startsWith(href) && !('exact' in item && item.exact);
              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-primary/15 text-primary elevated-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(
                    item.key as
                      | 'overview'
                      | 'posts'
                      | 'pages'
                      | 'media'
                      | 'categories'
                      | 'tags'
                      | 'portfolio'
                      | 'comments'
                      | 'users'
                      | 'settings',
                  )}
                </Link>
              );
            })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
