'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, LogOut, Menu, Moon, Sun, User } from 'lucide-react';
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
import { useTheme } from '@/shared/components/theme-provider';
import { getPublicSiteHomeUrl } from '@/shared/lib/site-url';
import { cn } from '@/shared/lib/utils';
import { MobileNav } from '@/features/layout/components/mobile-nav';
import { LocaleSwitcher } from '@/features/layout/components/locale-switcher';
import { AuthNavSwitch } from '@/features/layout/components/auth-nav-switch';
import { SiteBrand } from '@/features/layout/components/site-brand';

export function Header() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const publicSiteUrl = getPublicSiteHomeUrl(locale);

  const initials = user?.displayName?.slice(0, 2) ?? user?.username?.slice(0, 2) ?? '?';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="glass sticky top-4 z-50 mb-4 rounded-2xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {!isAuthPage ? (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            ) : null}
            <SiteBrand href={isAuthPage ? `/${locale}/login` : `/${locale}/dashboard`} />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isAuthPage ? (
              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'hidden h-9 gap-1.5 px-3 sm:inline-flex',
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
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-9 w-9 sm:hidden')}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">{t('viewSite')}</span>
              </a>
            ) : null}

            <LocaleSwitcher />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
              title={tTheme('toggle')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2">
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
