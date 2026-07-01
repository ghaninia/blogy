'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Header } from '@/features/layout/components/header';
import { DashboardSidebar } from '@/features/layout/components/sidebar';
import { useAuthStore } from '@/shared/store/auth';
import { Skeleton } from '@gh/ui';

const ADMIN_ONLY = ['/dashboard/users', '/dashboard/settings'];
const EDITOR_ONLY = ['/dashboard/pages', '/dashboard/categories', '/dashboard/tags', '/dashboard/portfolio', '/dashboard/comments'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { user, isLoading } = useAuthStore();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading || redirected.current) return;

    if (!user) {
      redirected.current = true;
      router.replace(`/${locale}/login`);
      return;
    }

    if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
      redirected.current = true;
      router.replace(`/${locale}`);
      return;
    }

    if (user.role !== 'ADMIN' && ADMIN_ONLY.some((p) => pathname.includes(p))) {
      redirected.current = true;
      router.replace(`/${locale}/dashboard`);
      return;
    }

    if (user.role === 'AUTHOR' && EDITOR_ONLY.some((p) => pathname.includes(p))) {
      redirected.current = true;
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, isLoading, router, locale, pathname]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-8 pt-4 sm:px-4 sm:pt-5">
        <Skeleton className="h-14 w-full shrink-0 rounded-2xl" />
        <div className="flex flex-1 gap-4 pt-4 md:items-stretch">
          <Skeleton className="hidden min-h-full w-60 rounded-2xl md:block" />
          <Skeleton className="min-h-96 flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-8 pt-4 sm:px-4 sm:pt-5">
      <Header />
      <div className="flex flex-1 flex-col gap-4 pt-4 md:flex-row md:items-stretch">
        <DashboardSidebar userRole={user.role} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
