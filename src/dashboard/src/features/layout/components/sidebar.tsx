'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { SidebarNavSections } from '@/features/layout/components/sidebar-nav';
import { SidebarUserFooter } from '@/features/layout/components/sidebar-user-footer';
import { SiteBrand } from '@/features/layout/components/site-brand';

export function DashboardSidebar({ userRole, collapsed = false }: { userRole: string; collapsed?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('dashboard');

  return (
    <aside
      className={cn(
        'dashboard-sidebar sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col overflow-hidden border-e transition-[width] duration-200 sm:top-5 sm:h-[calc(100vh-2.5rem)] md:flex',
        collapsed ? 'w-[68px]' : 'w-[252px]',
        locale === 'fa' && 'font-fa',
      )}
    >
      <div className={cn('dashboard-sidebar-brand flex min-h-[4.5rem] items-center px-5 py-4', collapsed && 'justify-center px-2')}>
        {collapsed ? (
          <Link href={`/${locale}/dashboard`} aria-label={t('title')} title={t('title')} className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {t('title').slice(0, 1)}
          </Link>
        ) : (
          <div className="min-w-0">
            <SiteBrand href={`/${locale}/dashboard`} />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('workspace')}</p>
          </div>
        )}
      </div>
      <div className={cn('flex min-h-0 flex-1 flex-col p-3', collapsed && 'px-2')}>
        <SidebarNavSections userRole={userRole} collapsed={collapsed} />
      </div>
      <SidebarUserFooter collapsed={collapsed} />
    </aside>
  );
}
