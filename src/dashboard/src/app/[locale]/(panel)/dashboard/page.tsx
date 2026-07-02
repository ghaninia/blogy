'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  FileText,
  History,
  Image,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gh/ui';
import { api, getPaginationMeta } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { useAuthStore } from '@/shared/store/auth';
import { isAdmin } from '@/shared/lib/localized';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  locale: string;
}

function StatCard({ title, value, icon, href, locale }: StatCardProps) {
  return (
    <Link href={`/${locale}${href}`}>
      <Card variant="glass" className="transition-all hover:brightness-105">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-primary">{icon}</div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardOverviewPage() {
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.overviewStats');
  const locale = useLocale();
  const { user } = useAuthStore();

  const isEditor = user && ['ADMIN', 'EDITOR'].includes(user.role);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-overview', user?.role],
    queryFn: async () => {
      const [posts, comments, media, experiences, users] = await Promise.all([
        api.get<unknown[]>('/api/posts', { limit: 1 }),
        api.get<unknown[]>('/api/comments', { status: 'PENDING', limit: 1 }),
        api.get<unknown[]>('/api/media', { limit: 1 }),
        isEditor
          ? api.get<unknown[]>('/api/experiences', { limit: 1 })
          : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
        user && isAdmin(user.role)
          ? api.get<unknown[]>('/api/auth/users', { limit: 1 })
          : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      ]);

      return {
        posts: getPaginationMeta(posts)?.total ?? posts.data?.length ?? 0,
        comments: getPaginationMeta(comments)?.total ?? 0,
        media: getPaginationMeta(media)?.total ?? media.data?.length ?? 0,
        experiences: getPaginationMeta(experiences)?.total ?? experiences.data?.length ?? 0,
        users: getPaginationMeta(users as never)?.total ?? 0,
      };
    },
    enabled: !!user,
  });

  return (
    <div>
      <PageHeader title={t('overview')} description={ts('description')} />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            title={ts('posts')}
            value={stats?.posts ?? 0}
            icon={<FileText className="h-5 w-5" />}
            href="/dashboard/posts"
            locale={locale}
          />
          <StatCard
            title={ts('pendingComments')}
            value={stats?.comments ?? 0}
            icon={<MessageSquare className="h-5 w-5" />}
            href="/dashboard/comments"
            locale={locale}
          />
          <StatCard
            title={ts('media')}
            value={stats?.media ?? 0}
            icon={<Image className="h-5 w-5" />}
            href="/dashboard/media"
            locale={locale}
          />
          {isEditor ? (
            <StatCard
              title={ts('experiences')}
              value={stats?.experiences ?? 0}
              icon={<History className="h-5 w-5" />}
              href="/dashboard/experiences"
              locale={locale}
            />
          ) : null}
          {user && isAdmin(user.role) ? (
            <StatCard
              title={ts('users')}
              value={stats?.users ?? 0}
              icon={<Users className="h-5 w-5" />}
              href="/dashboard/users"
              locale={locale}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
