'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, Button } from '@gh/ui';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/store/auth';

interface SidebarUserFooterProps {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
}

export function SidebarUserFooter({ onNavigate, className, collapsed = false }: SidebarUserFooterProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = user.displayName?.slice(0, 2) ?? user.username?.slice(0, 2) ?? '?';
  const BackChevron = locale === 'fa' ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn('dashboard-sidebar-footer shrink-0 border-t border-border p-3 pt-3', className)}
    >
      <div className={cn('rounded-2xl border border-border bg-muted/50 p-2', collapsed && 'border-transparent bg-transparent p-0')}>
        <Link
          href={`/${locale}/dashboard/profile`}
          onClick={onNavigate}
          aria-label={collapsed ? `${t('profile')}: ${user.displayName ?? user.username}` : undefined}
          title={collapsed ? user.displayName ?? user.username : undefined}
          className={cn('group flex items-center gap-2.5 rounded-xl p-1.5 text-foreground transition-colors hover:bg-background', collapsed && 'justify-center p-1')}
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', collapsed && 'sr-only')}>
            <p className="truncate text-sm font-medium leading-tight">
              {user.displayName ?? user.username}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          {!collapsed ? <BackChevron className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" /> : null}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          aria-label={collapsed ? t('logout') : undefined}
          title={collapsed ? t('logout') : undefined}
          className={cn('mt-1 h-8 w-full justify-start gap-2 rounded-lg text-xs text-muted-foreground hover:bg-background hover:text-foreground', collapsed && 'justify-center px-0')}
          onClick={() => {
            onNavigate?.();
            logout();
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className={cn(collapsed && 'sr-only')}>{t('logout')}</span>
        </Button>
      </div>
    </div>
  );
}
