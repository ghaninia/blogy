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
  { key: 'overview', href: '/dashboard', icon: LayoutDashboard, exact: true, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] as const },
  { key: 'posts', href: '/dashboard/posts', icon: FileText, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] as const },
  { key: 'pages', href: '/dashboard/pages', icon: File, roles: ['ADMIN', 'EDITOR'] as const },
  { key: 'media', href: '/dashboard/media', icon: Image, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] as const },
  { key: 'categories', href: '/dashboard/categories', icon: FolderTree, roles: ['ADMIN', 'EDITOR'] as const },
  { key: 'tags', href: '/dashboard/tags', icon: Tag, roles: ['ADMIN', 'EDITOR'] as const },
  { key: 'portfolio', href: '/dashboard/portfolio', icon: Briefcase, roles: ['ADMIN', 'EDITOR'] as const },
  { key: 'comments', href: '/dashboard/comments', icon: MessageSquare, roles: ['ADMIN', 'EDITOR'] as const },
] as const;

export const sidebarBottomItems = [
  { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] as const },
  { key: 'users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] as const },
] as const;

function canAccessItem(roles: readonly string[], userRole: string) {
  return roles.includes(userRole);
}

function SidebarLink({
  item,
  href,
  active,
  label,
}: {
  item: (typeof sidebarItems)[number] | (typeof sidebarBottomItems)[number];
  href: string;
  active: boolean;
  label: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        active
          ? 'bg-primary/15 text-primary elevated-primary font-semibold'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && !exact;

  const itemLabel = (key: string) =>
    t(key as 'overview' | 'posts' | 'pages' | 'media' | 'categories' | 'tags' | 'portfolio' | 'comments' | 'users' | 'settings');

  return (
    <aside className={cn('glass-strong hidden w-64 shrink-0 flex-col self-stretch rounded-2xl md:flex', locale === 'fa' && 'font-fa')}>
      <div className="flex shrink-0 items-center gap-2 border-b border-glass-border px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold">{t('title')}</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sidebarItems
          .filter((item) => canAccessItem(item.roles, userRole))
          .map((item) => {
          const href = `/${locale}${item.href}`;
          return (
            <SidebarLink
              key={item.key}
              item={item}
              href={href}
              active={isActive(href, 'exact' in item && item.exact)}
              label={itemLabel(item.key)}
            />
          );
        })}
      </nav>
      <nav className="shrink-0 space-y-1 border-t border-glass-border p-3">
        {sidebarBottomItems
          .filter((item) => canAccessItem(item.roles, userRole))
          .map((item) => {
            const href = `/${locale}${item.href}`;
            return (
              <SidebarLink
                key={item.key}
                item={item}
                href={href}
                active={isActive(href)}
                label={itemLabel(item.key)}
              />
            );
          })}
      </nav>
    </aside>
  );
}
