'use client';

import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

function navItemClass(active: boolean) {
  return cn(
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all duration-150',
    active
      ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
      : 'text-muted-foreground hover:bg-background/40 hover:text-foreground',
  );
}

export function AuthNavSwitch({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const isLogin = pathname.includes('/login');
  const isRegister = pathname.includes('/register');

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-glass-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label={`${t('login')} / ${t('register')}`}
    >
      <Link
        href={`/${locale}/login`}
        aria-current={isLogin ? 'page' : undefined}
        className={navItemClass(isLogin)}
      >
        <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{t('login')}</span>
      </Link>
      <Link
        href={`/${locale}/register`}
        aria-current={isRegister ? 'page' : undefined}
        className={navItemClass(isRegister)}
      >
        <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{t('register')}</span>
      </Link>
    </div>
  );
}
