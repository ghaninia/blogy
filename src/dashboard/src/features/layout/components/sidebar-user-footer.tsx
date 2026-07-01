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
}

export function SidebarUserFooter({ onNavigate, className }: SidebarUserFooterProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = user.displayName?.slice(0, 2) ?? user.username?.slice(0, 2) ?? '?';
  const BackChevron = locale === 'fa' ? ChevronLeft : ChevronRight;

  return (
    <div className={cn('shrink-0 p-3 pt-2', className)}>
      <div className="rounded-xl border border-glass-border bg-background/40 p-2">
        <Link
          href={`/${locale}/dashboard/profile`}
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-accent/35"
        >
          <Avatar className="h-9 w-9 border border-glass-border">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">
              {user.displayName ?? user.username}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <BackChevron className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-8 w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
}
