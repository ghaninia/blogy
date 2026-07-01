'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
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
  Plus,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type SidebarItemKey =
  | 'overview'
  | 'posts'
  | 'pages'
  | 'media'
  | 'categories'
  | 'tags'
  | 'portfolio'
  | 'comments'
  | 'users'
  | 'settings';

export interface SidebarNavItem {
  key: SidebarItemKey;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  roles: readonly string[];
}

export interface SidebarNavGroup {
  key: 'main' | 'content' | 'structure' | 'community';
  items: SidebarNavItem[];
}

const ROLES = {
  all: ['ADMIN', 'EDITOR', 'AUTHOR'] as const,
  editor: ['ADMIN', 'EDITOR'] as const,
  admin: ['ADMIN'] as const,
};

export const sidebarGroups: SidebarNavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'overview', href: '/dashboard', icon: LayoutDashboard, exact: true, roles: ROLES.all },
    ],
  },
  {
    key: 'content',
    items: [
      { key: 'posts', href: '/dashboard/posts', icon: FileText, roles: ROLES.all },
      { key: 'pages', href: '/dashboard/pages', icon: File, roles: ROLES.editor },
      { key: 'media', href: '/dashboard/media', icon: Image, roles: ROLES.all },
      { key: 'portfolio', href: '/dashboard/portfolio', icon: Briefcase, roles: ROLES.editor },
    ],
  },
  {
    key: 'structure',
    items: [
      { key: 'categories', href: '/dashboard/categories', icon: FolderTree, roles: ROLES.editor },
      { key: 'tags', href: '/dashboard/tags', icon: Tag, roles: ROLES.editor },
    ],
  },
  {
    key: 'community',
    items: [
      { key: 'comments', href: '/dashboard/comments', icon: MessageSquare, roles: ROLES.editor },
    ],
  },
];

export const sidebarSystemItems: SidebarNavItem[] = [
  { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ROLES.admin },
  { key: 'users', href: '/dashboard/users', icon: Users, roles: ROLES.admin },
];

/** @deprecated Use sidebarGroups */
export const sidebarItems = sidebarGroups.flatMap((g) => g.items);

/** @deprecated Use sidebarSystemItems */
export const sidebarBottomItems = sidebarSystemItems;

export function canAccessSidebarItem(roles: readonly string[], userRole: string) {
  return roles.includes(userRole);
}

export function isSidebarLinkActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href) && !exact;
}

interface SidebarNavLinkProps {
  item: SidebarNavItem;
  href: string;
  active: boolean;
  label: string;
  onNavigate?: () => void;
}

export function SidebarNavLink({ item, href, active, label, onNavigate }: SidebarNavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
        active
          ? 'border border-primary/25 bg-primary/12 text-primary elevated-sm'
          : 'border border-transparent text-muted-foreground hover:border-glass-border hover:bg-accent/30 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground',
        )}
        strokeWidth={active ? 2.25 : 2}
      />
      <span className={cn('min-w-0 flex-1 truncate', active && 'font-semibold')}>{label}</span>
    </Link>
  );
}

interface SidebarNewPostButtonProps {
  onNavigate?: () => void;
}

export function SidebarNewPostButton({ onNavigate }: SidebarNewPostButtonProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/dashboard/posts/new`}
      onClick={onNavigate}
      className="elevated-interactive-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      {t('newPost')}
    </Link>
  );
}

interface SidebarNavSectionsProps {
  userRole: string;
  onNavigate?: () => void;
  showSystem?: boolean;
  showNewPost?: boolean;
}

export function SidebarNavSections({
  userRole,
  onNavigate,
  showSystem = true,
  showNewPost = true,
}: SidebarNavSectionsProps) {
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.sidebar');
  const locale = useLocale();
  const pathname = usePathname();

  const itemLabel = (key: SidebarItemKey) => t(key);

  const renderItem = (item: SidebarNavItem) => {
    if (!canAccessSidebarItem(item.roles, userRole)) return null;
    const href = `/${locale}${item.href}`;
    return (
      <SidebarNavLink
        key={item.key}
        item={item}
        href={href}
        active={isSidebarLinkActive(pathname, href, item.exact)}
        label={itemLabel(item.key)}
        onNavigate={onNavigate}
      />
    );
  };

  const visibleSystemItems = sidebarSystemItems.filter((item) =>
    canAccessSidebarItem(item.roles, userRole),
  );

  return (
    <div className="flex h-full flex-col">
      {showNewPost ? (
        <div className="mb-4 shrink-0 px-1">
          <SidebarNewPostButton onNavigate={onNavigate} />
        </div>
      ) : null}

      <div className="sidebar-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-1">
        {sidebarGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccessSidebarItem(item.roles, userRole));
          if (visibleItems.length === 0) return null;

          const showLabel = group.key !== 'main' && visibleItems.length > 0;

          return (
            <div key={group.key}>
              {showLabel ? (
                <p className="mb-2 px-3 text-xs font-medium text-muted-foreground/75">{ts(group.key)}</p>
              ) : null}
              <div className="space-y-0.5">{group.items.map(renderItem)}</div>
            </div>
          );
        })}

        {showSystem && visibleSystemItems.length > 0 ? (
          <div className="pb-1">
            <div className="mb-3 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
            <p className="mb-2 px-3 text-xs font-medium text-muted-foreground/75">{ts('system')}</p>
            <div className="space-y-0.5">{sidebarSystemItems.map(renderItem)}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
