'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Header } from '@/features/layout/components/header';
import { DashboardSidebar } from '@/features/layout/components/sidebar';
import { useAuthStore } from '@/shared/store/auth';
import { Skeleton } from '@gh/ui';

const ADMIN_ONLY = ['/dashboard/users', '/dashboard/settings'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push(`/${locale}/login`);
      else if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
        router.push(`/${locale}`);
      } else if (
        user.role !== 'ADMIN' &&
        ADMIN_ONLY.some((p) => pathname.includes(p))
      ) {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, isLoading, router, locale, pathname]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="hidden h-96 w-64 rounded-2xl md:block" />
          <Skeleton className="h-96 flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <Header />
      <div className="flex flex-col gap-4 md:flex-row">
        <DashboardSidebar userRole={user.role} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
