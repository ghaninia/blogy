'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image,
  FolderTree,
  Tag,
  Briefcase,
  MessageSquare,
  Users,
  Settings,
  File,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const sidebarItems = [
  { key: 'overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { key: 'posts', href: '/dashboard/posts', icon: FileText },
  { key: 'pages', href: '/dashboard/pages', icon: File },
  { key: 'media', href: '/dashboard/media', icon: Image },
  { key: 'categories', href: '/dashboard/categories', icon: FolderTree },
  { key: 'tags', href: '/dashboard/tags', icon: Tag },
  { key: 'portfolio', href: '/dashboard/portfolio', icon: Briefcase },
  { key: 'comments', href: '/dashboard/comments', icon: MessageSquare },
  { key: 'users', href: '/dashboard/users', icon: Users, adminOnly: true },
  { key: 'settings', href: '/dashboard/settings', icon: Settings, adminOnly: true },
] as const;

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside className="glass-strong hidden w-64 shrink-0 flex-col rounded-2xl md:flex">
      <div className="flex items-center gap-2 border-b border-glass-border px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold">{t('title')}</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems
          .filter((item) => !('adminOnly' in item && item.adminOnly) || userRole === 'ADMIN')
          .map((item) => {
            const href = `/${locale}${item.href}`;
            const Icon = item.icon;
            const active = 'exact' in item && item.exact
              ? pathname === href
              : pathname.startsWith(href) && !('exact' in item && item.exact);
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/15 text-primary shadow-glass'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key as 'overview' | 'posts' | 'pages' | 'media' | 'categories' | 'tags' | 'portfolio' | 'comments' | 'users' | 'settings')}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
