'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpLeft,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  FolderOpen,
  FileText,
  History,
  Image,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings2,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gh/ui';
import { api, getPaginationMeta } from '@/shared/api-client';
import { useAuthStore } from '@/shared/store/auth';
import { formatDate, getLocalizedField, isAdmin } from '@/shared/lib/localized';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  locale: string;
  viewLabel: string;
}

interface OverviewPost {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  publishedAt?: string;
  updatedAt: string;
}

interface OverviewComment {
  id: string;
  content: string;
  createdAt: string;
  user?: { username: string; displayName?: string | null };
  post?: { id: string; slug: string; titleFa?: string; titleEn?: string };
}

function StatCard({ title, value, icon, href, locale, viewLabel }: StatCardProps) {
  const Arrow = locale === 'fa' ? ArrowUpLeft : ArrowUpRight;
  return (
    <Link
      href={`/${locale}${href}`}
      className="dashboard-stat group col-span-6 block h-full rounded-2xl sm:col-span-6 xl:col-span-2"
    >
      <Card
        variant="glass"
        className="dashboard-metric-card relative h-full overflow-hidden rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/35"
      >
        <CardContent className="flex min-h-32 items-center justify-between gap-3 p-5 sm:p-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {viewLabel}{' '}
              <Arrow className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="dashboard-stat-icon grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PostsFeature({
  locale,
  title,
  value,
  viewLabel,
  createLabel,
}: {
  locale: string;
  title: string;
  value: number | string;
  viewLabel: string;
  createLabel: string;
}) {
  const Arrow = locale === 'fa' ? ArrowUpLeft : ArrowUpRight;
  return (
    <section className="dashboard-post-feature relative col-span-12 flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-3xl p-5 sm:col-span-6 sm:p-6 xl:col-span-4 xl:row-span-2">
      <div className="dashboard-feature-ring dashboard-feature-ring-one" />
      <div className="dashboard-feature-ring dashboard-feature-ring-two" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary-foreground/65">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-primary-foreground sm:text-5xl">
            {value}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
          <FileText className="h-5 w-5" />
        </span>
      </div>
      <div className="relative mt-8 flex items-end justify-between gap-3">
        <Link
          href={`/${locale}/dashboard/posts`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/90 transition hover:text-primary-foreground"
        >
          {viewLabel}
          <Arrow className="h-4 w-4" />
        </Link>
        <Link
          href={`/${locale}/dashboard/posts/new`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-foreground px-4 text-xs font-semibold text-primary transition hover:-translate-y-0.5 hover:brightness-95"
        >
          <Plus className="h-3.5 w-3.5" />
          {createLabel}
        </Link>
      </div>
    </section>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
  locale,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  locale: string;
}) {
  const Arrow = locale === 'fa' ? ArrowUpLeft : ArrowUpRight;
  return (
    <Link
      href={`/${locale}${href}`}
      className="dashboard-quick-link group flex items-center gap-3 rounded-2xl p-3 transition-colors"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      <Arrow className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function DashboardOverviewPage() {
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.overviewStats');
  const tt = useTranslations('dashboard.table');
  const statusText = useTranslations('status');
  const locale = useLocale();
  const { user } = useAuthStore();
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const isEditor = user && ['ADMIN', 'EDITOR'].includes(user.role);
  const displayName = user?.displayName ?? user?.username;
  const dayNumber = today ? new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(today) : '—';
  const dayLabel = today
    ? new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'long' }).format(today)
    : '\u00a0';

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-overview', user?.role],
    queryFn: async () => {
      const [posts, drafts, scheduled, comments, media, experiences, users, subscribers] =
        await Promise.all([
          api.get<unknown[]>('/api/posts', { status: 'PUBLISHED', limit: 1 }),
          isEditor
            ? api.get<unknown[]>('/api/posts', { status: 'DRAFT', limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
          isEditor
            ? api.get<unknown[]>('/api/posts', { status: 'SCHEDULED', limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
          isEditor
            ? api.get<unknown[]>('/api/comments', { status: 'PENDING', limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
          api.get<unknown[]>('/api/media', { limit: 1 }),
          isEditor
            ? api.get<unknown[]>('/api/experiences', { limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
          user && isAdmin(user.role)
            ? api.get<unknown[]>('/api/auth/users', { limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
          isEditor
            ? api.get<unknown[]>('/api/subscribers', { limit: 1 })
            : Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
        ]);

      return {
        posts: getPaginationMeta(posts)?.total ?? posts.data?.length ?? 0,
        drafts: getPaginationMeta(drafts as never)?.total ?? 0,
        scheduled: getPaginationMeta(scheduled as never)?.total ?? 0,
        comments: getPaginationMeta(comments)?.total ?? 0,
        media: getPaginationMeta(media)?.total ?? media.data?.length ?? 0,
        experiences: getPaginationMeta(experiences)?.total ?? experiences.data?.length ?? 0,
        users: getPaginationMeta(users as never)?.total ?? 0,
        subscribers: getPaginationMeta(subscribers as never)?.total ?? 0,
      };
    },
    enabled: !!user,
  });

  const {
    data: recent,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['dashboard-overview-recent', locale, user?.role],
    enabled: !!user,
    queryFn: async () => {
      const [posts, drafts, scheduled, comments] = await Promise.all([
        api.get<OverviewPost[]>('/api/posts', { page: 1, limit: 5, sort: 'newest' }),
        isEditor
          ? api.get<OverviewPost[]>('/api/posts', { page: 1, limit: 4, status: 'DRAFT' })
          : Promise.resolve({ success: true, data: [] as OverviewPost[] }),
        isEditor
          ? api.get<OverviewPost[]>('/api/posts', { page: 1, limit: 4, status: 'SCHEDULED' })
          : Promise.resolve({ success: true, data: [] as OverviewPost[] }),
        isEditor
          ? api.get<OverviewComment[]>('/api/comments', { page: 1, limit: 5 })
          : Promise.resolve({ success: true, data: [] as OverviewComment[] }),
      ]);
      return {
        posts: posts.data ?? [],
        drafts: drafts.data ?? [],
        scheduled: scheduled.data ?? [],
        comments: comments.data ?? [],
      };
    },
  });

  return (
    <div className="dashboard-overview space-y-8 pb-8">
      <section className="dashboard-welcome relative overflow-hidden rounded-[1.6rem] px-4 py-5 sm:px-6 sm:py-6">
        <div className="dashboard-welcome-orbit dashboard-welcome-orbit-one" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="dashboard-date-disc grid h-[4.2rem] w-[4.2rem] shrink-0 place-items-center rounded-full border border-border/70 bg-card text-2xl font-semibold tabular-nums shadow-sm sm:h-[4.6rem] sm:w-[4.6rem]">
              {dayNumber}
            </div>
            <div className="hidden h-12 w-px bg-border sm:block" />
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{dayLabel}</p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {ts('hello', { name: displayName ?? t('title') })}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {ts('welcome')}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard/posts/new`}
            className="dashboard-primary-action relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            {t('newPost')}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{ts('atAGlance')}</p>
          <h2 className="mt-1 text-lg font-semibold">{ts('statsTitle')}</h2>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
          <CalendarDays className="h-3.5 w-3.5" />
          {ts('liveOverview')}
        </span>
      </div>

      {isError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{tt('loadError')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
            }}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {tt('retry')}
          </Button>
        </div>
      ) : null}

      <div className="dashboard-bento grid grid-cols-12 items-stretch gap-3">
        {isLoading ? (
          <>
            <Skeleton className="col-span-12 min-h-64 rounded-3xl sm:col-span-6 xl:col-span-4 xl:row-span-2" />
            <Skeleton className="col-span-6 min-h-32 rounded-2xl xl:col-span-2" />
            <Skeleton className="col-span-6 min-h-32 rounded-2xl xl:col-span-2" />
            <Skeleton className="col-span-12 min-h-64 rounded-3xl sm:col-span-6 xl:col-span-4 xl:row-span-2" />
          </>
        ) : (
          <>
            <PostsFeature
              locale={locale}
              title={ts('posts')}
              value={stats?.posts ?? (isError ? '—' : 0)}
              viewLabel={ts('view')}
              createLabel={t('newPost')}
            />
            {isEditor ? (
              <StatCard
                title={ts('pendingComments')}
                value={stats?.comments ?? (isError ? '—' : 0)}
                icon={<MessageSquare className="h-5 w-5" />}
                href="/dashboard/comments"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
            {isEditor ? (
              <StatCard
                title={ts('subscribers')}
                value={stats?.subscribers ?? (isError ? '—' : 0)}
                icon={<Users className="h-5 w-5" />}
                href="/dashboard/subscribers"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
            {isEditor ? (
              <StatCard
                title={ts('drafts')}
                value={stats?.drafts ?? (isError ? '—' : 0)}
                icon={<FileText className="h-5 w-5" />}
                href="/dashboard/posts"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
            {isEditor ? (
              <StatCard
                title={ts('scheduledPosts')}
                value={stats?.scheduled ?? (isError ? '—' : 0)}
                icon={<CalendarDays className="h-5 w-5" />}
                href="/dashboard/posts"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
            <StatCard
              title={ts('media')}
              value={stats?.media ?? (isError ? '—' : 0)}
              icon={<Image className="h-5 w-5" />}
              href="/dashboard/media"
              locale={locale}
              viewLabel={ts('view')}
            />
            <section className="dashboard-widget col-span-12 rounded-3xl p-4 sm:col-span-6 sm:p-5 xl:col-span-4 xl:row-span-2">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {ts('workspaceEyebrow')}
                  </p>
                  <h2 className="mt-1 text-base font-semibold">{ts('quickAccess')}</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-muted/70 text-muted-foreground">
                  <Settings2 className="h-4 w-4" />
                </span>
              </div>
              <div className="grid gap-1">
                <QuickLink
                  href="/dashboard/posts"
                  title={t('posts')}
                  description={ts('managePosts')}
                  icon={FileText}
                  locale={locale}
                />
                <QuickLink
                  href="/dashboard/media"
                  title={t('media')}
                  description={ts('manageMedia')}
                  icon={Image}
                  locale={locale}
                />
                {isEditor ? (
                  <QuickLink
                    href="/dashboard/categories"
                    title={t('categories')}
                    description={ts('manageCategories')}
                    icon={FolderOpen}
                    locale={locale}
                  />
                ) : null}
                {isEditor ? (
                  <QuickLink
                    href="/dashboard/comments"
                    title={t('comments')}
                    description={ts('manageComments')}
                    icon={MessageSquare}
                    locale={locale}
                  />
                ) : null}
                {user && isAdmin(user.role) ? (
                  <QuickLink
                    href="/dashboard/settings"
                    title={t('settings')}
                    description={ts('manageSettings')}
                    icon={Settings2}
                    locale={locale}
                  />
                ) : null}
              </div>
            </section>
            {isEditor ? (
              <StatCard
                title={ts('experiences')}
                value={stats?.experiences ?? (isError ? '—' : 0)}
                icon={<History className="h-5 w-5" />}
                href="/dashboard/experiences"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
            {user && isAdmin(user.role) ? (
              <StatCard
                title={ts('users')}
                value={stats?.users ?? (isError ? '—' : 0)}
                icon={<Users className="h-5 w-5" />}
                href="/dashboard/users"
                locale={locale}
                viewLabel={ts('view')}
              />
            ) : null}
          </>
        )}
      </div>

      <section
        className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
        aria-label={ts('recentActivity')}
      >
        <Card variant="glass" className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{ts('recentPosts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))
            ) : recentError ? (
              <div
                className="flex items-center justify-between gap-3 px-2 py-4 text-sm"
                role="alert"
              >
                <span className="text-muted-foreground">{tt('loadError')}</span>
                <Button variant="ghost" size="sm" onClick={() => void refetchRecent()}>
                  {tt('retry')}
                </Button>
              </div>
            ) : recent?.posts.length ? (
              recent.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${locale}/dashboard/posts/${post.id}/edit`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition hover:bg-muted/60 focus-visible:bg-muted/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {getLocalizedField(post, 'title', locale) || post.slug}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatDate(post.updatedAt, locale)}
                    </span>
                  </span>
                  <Badge
                    variant={
                      post.status === 'PUBLISHED'
                        ? 'success'
                        : post.status === 'SCHEDULED'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {statusText(post.status)}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="px-3 py-5 text-sm text-muted-foreground">{tt('empty')}</p>
            )}
          </CardContent>
        </Card>

        {isEditor ? (
          <Card variant="glass" className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{ts('writingQueue')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLoading ? (
                <>
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </>
              ) : recentError ? (
                <div className="flex items-center justify-between gap-3 py-4 text-sm" role="alert">
                  <span className="text-muted-foreground">{tt('loadError')}</span>
                  <Button variant="ghost" size="sm" onClick={() => void refetchRecent()}>
                    {tt('retry')}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{ts('drafts')}</span>
                      <span>{stats?.drafts ?? recent?.drafts.length ?? 0}</span>
                    </div>
                    {recent?.drafts.length ? (
                      recent.drafts.slice(0, 3).map((post) => (
                        <Link
                          key={post.id}
                          href={`/${locale}/dashboard/posts/${post.id}/edit`}
                          className="block truncate rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                        >
                          {getLocalizedField(post, 'title', locale) || post.slug}
                        </Link>
                      ))
                    ) : (
                      <p className="px-2 py-1 text-xs text-muted-foreground">{tt('empty')}</p>
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{ts('scheduledPosts')}</span>
                      <span>{stats?.scheduled ?? recent?.scheduled.length ?? 0}</span>
                    </div>
                    {recent?.scheduled.length ? (
                      recent.scheduled.slice(0, 3).map((post) => (
                        <Link
                          key={post.id}
                          href={`/${locale}/dashboard/posts/${post.id}/edit`}
                          className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                        >
                          <span className="truncate">
                            {getLocalizedField(post, 'title', locale) || post.slug}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {post.publishedAt ? formatDate(post.publishedAt, locale) : ''}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="px-2 py-1 text-xs text-muted-foreground">{tt('empty')}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}

        {isEditor ? (
          <Card variant="glass" className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{ts('recentComments')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))
              ) : recentError ? (
                <div
                  className="flex items-center justify-between gap-3 px-2 py-4 text-sm"
                  role="alert"
                >
                  <span className="text-muted-foreground">{tt('loadError')}</span>
                  <Button variant="ghost" size="sm" onClick={() => void refetchRecent()}>
                    {tt('retry')}
                  </Button>
                </div>
              ) : recent?.comments.length ? (
                recent.comments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/${locale}/dashboard/comments`}
                    className="block rounded-lg px-3 py-2.5 hover:bg-muted/60"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">
                        {comment.user?.displayName || comment.user?.username || '—'}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(comment.createdAt, locale)}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {comment.content}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                      {comment.post
                        ? getLocalizedField(comment.post, 'title', locale) || comment.post.slug
                        : ''}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-5 text-sm text-muted-foreground">{tt('empty')}</p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
