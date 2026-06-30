'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, LogOut, Moon, Sun, User } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gh/ui';
import { useAuthStore } from '@/shared/store/auth';
import { useTheme } from '@/shared/components/theme-provider';

export function Header() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();

  const switchLocale = locale === 'fa' ? 'en' : 'fa';
  const switchPath = pathname.replace(`/${locale}`, `/${switchLocale}`);

  const initials = user?.displayName?.slice(0, 2) ?? user?.username?.slice(0, 2) ?? '?';

  return (
    <header className="glass sticky top-0 z-50 mb-4 rounded-2xl">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href={`/${locale}/dashboard`} className="text-lg font-bold text-primary">
          GH Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={tTheme('toggle')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link href={switchPath}>
            <Button variant="ghost" size="sm" className="gap-1">
              <Globe className="h-4 w-4" />
              {switchLocale.toUpperCase()}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">
                    {user.displayName ?? user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass w-48">
                <DropdownMenuItem onClick={() => router.push(`/${locale}/profile`)}>
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
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">{t('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm">{t('register')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
