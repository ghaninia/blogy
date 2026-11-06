'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Header } from '@/features/layout/components/header';
import { DashboardSidebar } from '@/features/layout/components/sidebar';
import { useAuthStore } from '@/shared/store/auth';
import { Skeleton } from '@gh/ui';

const ADMIN_ONLY = [
  '/dashboard/users',
  '/dashboard/settings',
  '/dashboard/seo',
  '/dashboard/appearance',
  '/dashboard/navigation',
];
const EDITOR_ONLY = [
  '/dashboard/pages',
  '/dashboard/categories',
  '/dashboard/tags',
  '/dashboard/portfolio',
  '/dashboard/experiences',
  '/dashboard/comments',
  '/dashboard/subscribers',
  '/dashboard/newsletter',
  '/dashboard/analytics',
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { user, isLoading } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      <div className="dashboard-frame min-h-screen p-2 sm:p-5">
        <div className="dashboard-shell mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1500px] flex-col overflow-hidden rounded-[1.5rem] p-4 sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[2rem] sm:p-7 lg:p-9">
          <Skeleton className="h-14 w-full shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-5 pt-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="min-h-72 rounded-3xl" />
              <Skeleton className="min-h-72 rounded-3xl" />
              <Skeleton className="min-h-72 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-frame min-h-screen p-2 sm:p-5">
      <div className="dashboard-shell mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1500px] flex-row overflow-clip rounded-[1.5rem] sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[1.5rem]">
        <DashboardSidebar userRole={user.role} collapsed={sidebarCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
          <main className="dashboard-main min-w-0 flex-1 px-4 pb-7 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
