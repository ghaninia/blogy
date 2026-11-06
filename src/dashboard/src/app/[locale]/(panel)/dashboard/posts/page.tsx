'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Archive, Copy, Grid2X2, List, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { api, getMediaUrl } from '@/shared/api-client';
import { getLocalizedField, formatDate, canDeletePost } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { postToForm, formToPayload } from '@/features/posts/components/post-form';

interface Post {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  status: string;
  publishedAt?: string;
  author?: { displayName?: string; username: string };
  coverMedia?: { path: string } | null;
  excerptFa?: string;
  excerptEn?: string;
}

const STATUS_VARIANT: Record<string, 'secondary' | 'success' | 'warning'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  SCHEDULED: 'warning',
  ARCHIVED: 'secondary',
};

export default function DashboardPostsPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const tToast = useTranslations('dashboard.toast');
  const tp = useTranslations('dashboard.postsPage');
  const { toast: showToast } = useToast();
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [bulkBusy, setBulkBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { items, meta, isLoading, isError, refetch } = useCrudList<Post>({
    queryKey: ['dashboard-posts'],
    endpoint: '/api/posts',
    params: {
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'all' ? undefined : status,
      sort,
    },
  });

  const handleDelete = (post: Post) => {
    confirmDelete({
      title: t('confirm.deleteTitle'),
      description: t('confirm.deletePost'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/posts/${post.id}`);
          showToast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-posts'] });
        } catch {
          showToast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const duplicatePost = async (post: Post) => {
    try {
      const response = await api.get<Record<string, unknown>>(`/api/posts/${post.id}`);
      if (!response.data) throw new Error('Post data was not returned');
      const { form } = postToForm(response.data);
      const duplicated = {
        ...form,
        status: 'DRAFT' as const,
        slug: `${form.slug || post.slug}-copy-${Date.now().toString(36)}`,
        publishedAt: '',
      };
      const created = await api.post<{ id: string }>('/api/posts', formToPayload(duplicated));
      showToast({ title: tp('duplicated'), variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['dashboard-posts'] });
      if (created.data?.id) router.push(`/${locale}/dashboard/posts/${created.data.id}/edit`);
    } catch {
      showToast({ title: tToast('error'), variant: 'destructive' });
    }
  };

  const runBulkAction = async (action: 'PUBLISH' | 'ARCHIVE' | 'DELETE') => {
    const ids = [...selectedIds];
    if (!ids.length || bulkBusy) return;
    setBulkBusy(true);
    try {
      await api.post('/api/posts/bulk', { ids, action });
      showToast({
        title: action === 'DELETE' ? tToast('deleted') : tToast('saved'),
        variant: 'success',
      });
      setSelectedIds(new Set());
      await qc.invalidateQueries({ queryKey: ['dashboard-posts'] });
    } catch {
      showToast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmBulkDelete = () => {
    confirmDelete({
      title: t('confirm.deleteTitle'),
      description: tp('bulkDeleteConfirm', { count: selectedIds.size }),
      onConfirm: () => runBulkAction('DELETE'),
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectCurrentPage = () => {
    const allSelected = items.length > 0 && items.every((post) => selectedIds.has(post.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      items.forEach(({ id }) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const canDelete = user ? canDeletePost(user.role) : false;

  return (
    <div>
      <PageHeader
        title={t('posts')}
        action={
          <Link href={`/${locale}/dashboard/posts/new`}>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t('newPost')}
            </Button>
          </Link>
        }
      />

      <CardFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
          setSelectedIds(new Set());
        }}
        status={status}
        sort={sort}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
          setSelectedIds(new Set());
        }}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
          setSelectedIds(new Set());
        }}
        searchPlaceholder={tt('search')}
        statusLabel={tt('status')}
        ts={ts}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {canDelete ? (
          <div className="flex min-h-10 flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={selectCurrentPage}
              disabled={!items.length}
            >
              {items.length > 0 && items.every(({ id }) => selectedIds.has(id))
                ? tp('clearSelection')
                : tp('selectPage')}
            </Button>
            {selectedIds.size ? (
              <>
                <span className="me-1 text-sm font-medium" aria-live="polite">
                  {tp('selectedCount', { count: selectedIds.size })}
                </span>
                <Button size="sm" onClick={() => void runBulkAction('PUBLISH')} disabled={bulkBusy}>
                  <Send className="me-2 h-4 w-4" />
                  {tp('publishSelected')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void runBulkAction('ARCHIVE')}
                  disabled={bulkBusy}
                >
                  <Archive className="me-2 h-4 w-4" />
                  {tp('archiveSelected')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={confirmBulkDelete}
                  disabled={bulkBusy}
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {tp('deleteSelected')}
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <div
          className="ms-auto inline-flex rounded-xl border border-border bg-card p-1"
          role="group"
          aria-label={tp('viewMode')}
        >
          <Button
            type="button"
            size="sm"
            variant={view === 'table' ? 'secondary' : 'ghost'}
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
            aria-label={tp('tableView')}
            title={tp('tableView')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label={tp('gridView')}
            title={tp('gridView')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          void refetch();
        }}
        isEmpty={!isLoading && items.length === 0}
        items={items}
        mobileCardRender={(post) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {getLocalizedField(post, 'title', locale) || post.slug}
                </p>
                <p className="truncate text-xs text-muted-foreground">{post.slug}</p>
              </div>
              <Badge variant={STATUS_VARIANT[post.status] ?? 'secondary'} className="shrink-0">
                {ts(post.status as 'DRAFT')}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{tt('date')}</span>
              <span>{post.publishedAt ? formatDate(post.publishedAt, locale) : '—'}</span>
            </div>
            {canDelete ? (
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedIds.has(post.id)}
                  onChange={() => toggleSelected(post.id)}
                  aria-label={tp('selectPost', {
                    title: getLocalizedField(post, 'title', locale) || post.slug,
                  })}
                />
                {tp('select')}
              </label>
            ) : null}
            <div className="flex justify-end gap-2 border-t border-border pt-2">
              <Link href={`/${locale}/dashboard/posts/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="me-2 h-4 w-4" />
                  {t('actions.edit')}
                </Button>
              </Link>
              {canDelete ? (
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post)}>
                  <Trash2 className="me-2 h-4 w-4 text-destructive" />
                  {t('actions.delete')}
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => void duplicatePost(post)}>
                <Copy className="me-2 h-4 w-4" />
                {tp('duplicate')}
              </Button>
            </div>
          </div>
        )}
        pagination={{
          page,
          meta,
          onPageChange: (next) => {
            setPage(next);
            setSelectedIds(new Set());
          },
        }}
      >
        {view === 'grid' ? (
          <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((post) => {
              const title = getLocalizedField(post, 'title', locale) || post.slug;
              const excerpt = getLocalizedField(post, 'excerpt', locale);
              const cover = post.coverMedia?.path ? getMediaUrl(post.coverMedia.path) : null;
              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/35"
                >
                  {cover ? (
                    <div className="relative aspect-[16/9] bg-muted">
                      <Image src={cover} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="grid aspect-[16/9] place-items-center bg-muted/60 text-muted-foreground">
                      <Pencil className="h-6 w-6" />
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 min-h-10 font-semibold leading-5">{title}</h2>
                      <Badge
                        variant={STATUS_VARIANT[post.status] ?? 'secondary'}
                        className="shrink-0"
                      >
                        {ts(post.status as 'DRAFT')}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                      {excerpt || post.slug}
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>{post.author?.displayName ?? post.author?.username ?? '—'}</span>
                      <span>{post.publishedAt ? formatDate(post.publishedAt, locale) : '—'}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {canDelete ? (
                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post.id)}
                            onChange={() => toggleSelected(post.id)}
                            aria-label={tp('selectPost', { title })}
                          />
                          {tp('select')}
                        </label>
                      ) : (
                        <span />
                      )}
                      <div className="flex gap-1">
                        <Link href={`/${locale}/dashboard/posts/${post.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`${t('actions.edit')}: ${title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void duplicatePost(post)}
                          aria-label={`${tp('duplicate')}: ${title}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {canDelete ? (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every(({ id }) => selectedIds.has(id))}
                      onChange={selectCurrentPage}
                      aria-label={tp('selectCurrentPage')}
                    />
                  </TableHead>
                ) : null}
                <TableHead>{tt('title')}</TableHead>
                <TableHead>{tt('status')}</TableHead>
                <TableHead>{tt('date')}</TableHead>
                <TableHead className="text-end">{tt('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((post) => (
                <TableRow key={post.id}>
                  {canDelete ? (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={() => toggleSelected(post.id)}
                        aria-label={tp('selectPost', {
                          title: getLocalizedField(post, 'title', locale) || post.slug,
                        })}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {getLocalizedField(post, 'title', locale) || post.slug}
                      </p>
                      <p className="text-xs text-muted-foreground">{post.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[post.status] ?? 'secondary'}>
                      {ts(post.status as 'DRAFT')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.publishedAt ? formatDate(post.publishedAt, locale) : '—'}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-2">
                      <Link href={`/${locale}/dashboard/posts/${post.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label={t('actions.edit')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={tp('duplicate')}
                        onClick={() => void duplicatePost(post)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('actions.delete')}
                          onClick={() => handleDelete(post)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>

      <DeleteDialog />
    </div>
  );
}

function CardFilters({
  search,
  onSearchChange,
  status,
  sort,
  onSortChange,
  onStatusChange,
  searchPlaceholder,
  statusLabel,
  ts,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  sort: 'newest' | 'oldest' | 'title';
  onSortChange: (v: 'newest' | 'oldest' | 'title') => void;
  onStatusChange: (v: string) => void;
  searchPlaceholder: string;
  statusLabel: string;
  ts: ReturnType<typeof useTranslations<'status'>>;
}) {
  const tp = useTranslations('dashboard.postsPage');

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={statusLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{statusLabel}</SelectItem>
          <SelectItem value="DRAFT">{ts('DRAFT')}</SelectItem>
          <SelectItem value="PUBLISHED">{ts('PUBLISHED')}</SelectItem>
          <SelectItem value="SCHEDULED">{ts('SCHEDULED')}</SelectItem>
          <SelectItem value="ARCHIVED">{ts('ARCHIVED')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(value) => onSortChange(value as typeof sort)}>
        <SelectTrigger className="w-40" aria-label={tp('sort')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{tp('newest')}</SelectItem>
          <SelectItem value="oldest">{tp('oldest')}</SelectItem>
          <SelectItem value="title">{tp('titleSort')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
