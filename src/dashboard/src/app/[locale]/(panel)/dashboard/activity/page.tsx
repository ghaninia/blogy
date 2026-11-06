'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { FileText, Image as ImageIcon, MessageSquare, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, CardContent, EmptyState, Skeleton } from '@gh/ui';
import { api } from '@/shared/api-client';
import { formatDate, getLocalizedField } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';

type ActivityType = 'post' | 'comment' | 'media';
type ActivityFilter = 'all' | ActivityType;

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  createdAt: string;
  href: string;
  status?: string;
}

interface PostRecord {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentRecord {
  id: string;
  content: string;
  createdAt: string;
  user?: { username?: string; displayName?: string };
}

interface MediaRecord {
  id: string;
  originalName: string;
  mimeType: string;
  createdAt: string;
}

export default function DashboardActivityPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const ta = useTranslations('dashboard.activityPage');
  const tt = useTranslations('dashboard.table');
  const tc = useTranslations('common');
  const ts = useTranslations('status');
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-activity', locale],
    queryFn: async () => {
      const responses = await Promise.allSettled([
        api.get<PostRecord[]>('/api/posts', { page: 1, limit: 10 }),
        api.get<CommentRecord[]>('/api/comments', { page: 1, limit: 10 }),
        api.get<MediaRecord[]>('/api/media', { page: 1, limit: 10 }),
      ]);
      const fulfilled = responses.filter((result) => result.status === 'fulfilled');
      if (fulfilled.length === 0) throw new Error('Unable to load workspace activity');

      const [postsResponse, commentsResponse, mediaResponse] = responses;
      const items: ActivityItem[] = [];

      if (postsResponse.status === 'fulfilled') {
        for (const post of postsResponse.value.data ?? []) {
          items.push({
            id: post.id,
            type: 'post',
            title: getLocalizedField(post, 'title', locale) || post.slug,
            detail: ta('postCreated'),
            createdAt: post.updatedAt || post.createdAt,
            href: `/${locale}/dashboard/posts/${post.id}/edit`,
            status: post.status,
          });
        }
      }

      if (commentsResponse.status === 'fulfilled') {
        for (const comment of commentsResponse.value.data ?? []) {
          items.push({
            id: comment.id,
            type: 'comment',
            title: comment.content,
            detail: comment.user?.displayName ?? comment.user?.username ?? ta('commentReceived'),
            createdAt: comment.createdAt,
            href: `/${locale}/dashboard/comments`,
          });
        }
      }

      if (mediaResponse.status === 'fulfilled') {
        for (const media of mediaResponse.value.data ?? []) {
          items.push({
            id: media.id,
            type: 'media',
            title: media.originalName,
            detail: media.mimeType,
            createdAt: media.createdAt,
            href: `/${locale}/dashboard/media`,
          });
        }
      }

      return items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    },
  });

  const visibleItems = (data ?? []).filter((item) => filter === 'all' || item.type === filter);
  const filters: ActivityFilter[] = ['all', 'post', 'comment', 'media'];
  const filterLabel: Record<ActivityFilter, string> = {
    all: ta('all'),
    post: ta('posts'),
    comment: ta('comments'),
    media: ta('media'),
  };

  return (
    <div>
      <PageHeader title={t('activity')} description={ta('description')} />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={ta('all')}>
        {filters.map((value) => (
          <Button
            key={value}
            variant={filter === value ? 'secondary' : 'ghost'}
            size="sm"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {filterLabel[value]}
          </Button>
        ))}
      </div>

      <Card variant="glass">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-5" aria-label={tc('loading')}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center" role="alert">
              <p className="text-sm font-medium">{tt('loadError')}</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                <RefreshCw className="me-2 h-4 w-4" />
                {tt('retry')}
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <EmptyState
              title={ta('empty')}
              description={ta('emptyDescription')}
              className="py-14"
            />
          ) : (
            <ol className="divide-y divide-border">
              {visibleItems.map((item) => {
                const Icon =
                  item.type === 'post'
                    ? FileText
                    : item.type === 'comment'
                      ? MessageSquare
                      : ImageIcon;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex min-w-0 items-start gap-3 px-4 py-4 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:items-center sm:gap-4 sm:px-5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                      {item.status ? (
                        <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                          {ts(item.status as 'DRAFT')}
                        </Badge>
                      ) : null}
                      <time
                        dateTime={item.createdAt}
                        className="shrink-0 text-xs text-muted-foreground"
                      >
                        {formatDate(item.createdAt, locale)}
                      </time>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
