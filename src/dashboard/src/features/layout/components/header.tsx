'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, LogOut, Menu, PanelLeft, PanelLeftClose, Plus, User } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gh/ui';
import { useAuthStore } from '@/shared/store/auth';
import { getPublicSiteHomeUrl } from '@/shared/lib/site-url';
import { cn } from '@/shared/lib/utils';
import { MobileNav } from '@/features/layout/components/mobile-nav';
import { LocaleSwitcher } from '@/features/layout/components/locale-switcher';
import { AuthNavSwitch } from '@/features/layout/components/auth-nav-switch';
import { SiteBrand } from '@/features/layout/components/site-brand';
import { ThemeSelector } from '@/features/layout/components/theme-selector';
import { CommandPalette } from '@/features/layout/components/command-palette';

export function Header({
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
}: {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const t = useTranslations('nav');
  const td = useTranslations('dashboard');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const publicSiteUrl = getPublicSiteHomeUrl(locale);

  const initials = user?.displayName?.slice(0, 2) ?? user?.username?.slice(0, 2) ?? '?';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="dashboard-topbar relative z-20 mb-5 border-b border-border/70 bg-background/85 px-1 backdrop-blur-xl sm:mb-7">
        <div className="flex min-h-[62px] items-center justify-between gap-3 px-1 sm:min-h-[72px] sm:px-2">
          <div className="flex min-w-0 items-center gap-2">
            {!isAuthPage ? (
              <Button
                variant="ghost"
                size="icon"
                className="dashboard-menu-button h-10 w-10 shrink-0 rounded-full"
                onClick={() => {
                  if (window.matchMedia('(min-width: 768px)').matches) onToggleSidebar();
                  else setMobileNavOpen(true);
                }}
                aria-label={t('toggleNavigation')}
                title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
              >
                <Menu className="h-5 w-5 md:hidden" />
                {sidebarCollapsed ? (
                  <PanelLeft className="hidden h-5 w-5 md:block" />
                ) : (
                  <PanelLeftClose className="hidden h-5 w-5 md:block" />
                )}
              </Button>
            ) : null}
            <SiteBrand href={isAuthPage ? `/${locale}/login` : `/${locale}/dashboard`} />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isAuthPage ? <CommandPalette /> : null}
            {!isAuthPage ? (
              <Link
                href={`/${locale}/dashboard/posts/new`}
                className="dashboard-header-add grid h-9 w-9 place-items-center rounded-full transition hover:-translate-y-0.5 sm:me-1"
                title={td('newPost')}
                aria-label={td('newPost')}
              >
                <Plus className="h-4 w-4" />
              </Link>
            ) : null}

            {!isAuthPage ? (
              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'hidden h-9 gap-1.5 rounded-full px-4 sm:inline-flex',
                )}
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t('viewSite')}</span>
              </a>
            ) : null}

            {!isAuthPage ? (
              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t('viewSite')}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-9 w-9 rounded-full sm:hidden',
                )}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">{t('viewSite')}</span>
              </a>
            ) : null}

            <LocaleSwitcher />

            <ThemeSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-full px-2"
                    aria-label={`${t('profile')}: ${user.displayName ?? user.username}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-xs text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm sm:inline">
                      {user.displayName ?? user.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass w-48">
                  <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/profile`)}>
                    <User className="me-2 h-4 w-4" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="me-2 h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthNavSwitch />
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen && !isAuthPage} onOpenChange={setMobileNavOpen} />
    </>
  );
}
