'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { SidebarNavSections } from '@/features/layout/components/sidebar-nav';
import { SidebarUserFooter } from '@/features/layout/components/sidebar-user-footer';

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const locale = useLocale();

  return (
    <aside
      className={cn(
        'glass-strong hidden w-60 shrink-0 flex-col self-stretch overflow-hidden rounded-2xl md:flex',
        locale === 'fa' && 'font-fa',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <SidebarNavSections userRole={userRole} />
      </div>
      <SidebarUserFooter />
    </aside>
  );
}
