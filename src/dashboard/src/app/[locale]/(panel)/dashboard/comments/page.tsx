'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MessageCircleReply, Search, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useToast,
} from '@gh/ui';
import { api, getMediaUrl } from '@/shared/api-client';
import { getLocalizedField, formatDate } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';

interface Comment {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  postId: string;
  user: { username: string; displayName?: string; email?: string; avatarUrl?: string | null };
  post: { id: string; slug: string; titleEn?: string; titleFa?: string };
}

const STATUSES = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'SPAM'] as const;

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  SPAM: 'secondary',
};

export default function DashboardCommentsPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const tToast = useTranslations('dashboard.toast');
  const tc = useTranslations('dashboard.commentsPage');
  const { toast } = useToast();
  const locale = useLocale();
  const qc = useQueryClient();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [status, setStatus] = useState<string>('PENDING');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [postId, setPostId] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySaving, setReplySaving] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { data: postOptions = [] } = useQuery({
    queryKey: ['comment-post-options'],
    queryFn: async () => {
      const response = await api.get<
        Array<{ id: string; slug: string; titleEn?: string; titleFa?: string }>
      >('/api/posts', { page: 1, limit: 100 });
      return response.data ?? [];
    },
  });

  const { items, meta, isLoading, isError, refetch } = useCrudList<Comment>({
    queryKey: ['dashboard-comments'],
    endpoint: '/api/comments',
    params: {
      status: status === 'all' ? undefined : status,
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      postId: postId === 'all' ? undefined : postId,
      search: debouncedSearch || undefined,
    },
  });

  const moderate = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'SPAM') => {
    try {
      await api.patch(`/api/comments/${id}/moderate`, { status: newStatus });
      toast({ title: tToast('saved'), variant: 'success' });
      qc.invalidateQueries({ queryKey: ['dashboard-comments'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    }
  };

  const runBulkAction = async (action: 'APPROVED' | 'REJECTED' | 'SPAM' | 'DELETE') => {
    if (!selectedIds.size || bulkBusy) return;
    setBulkBusy(true);
    try {
      await api.post('/api/comments/bulk', { ids: [...selectedIds], action });
      toast({
        title: action === 'DELETE' ? tToast('deleted') : tToast('saved'),
        variant: 'success',
      });
      setSelectedIds(new Set());
      await qc.invalidateQueries({ queryKey: ['dashboard-comments'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmBulkDelete = () => {
    confirmDelete({
      title: t('confirm.deleteTitle'),
      description: tc('bulkDeleteConfirm', { count: selectedIds.size }),
      onConfirm: () => runBulkAction('DELETE'),
    });
  };

  const selectVisible = () => {
    const allSelected = items.length > 0 && items.every((comment) => selectedIds.has(comment.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      items.forEach(({ id }) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const openReply = (comment: Comment) => {
    setReplyTarget(comment);
    setReplyText('');
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyTarget || !replyText.trim()) return;
    setReplySaving(true);
    try {
      await api.post(`/api/comments/${replyTarget.id}/reply`, { content: replyText.trim() });
      toast({ title: tToast('saved'), variant: 'success' });
      setReplyTarget(null);
      await qc.invalidateQueries({ queryKey: ['dashboard-comments'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setReplySaving(false);
    }
  };

  const handleDelete = (comment: Comment) => {
    confirmDelete({
      description: t('confirm.deleteComment'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/comments/${comment.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-comments'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  return (
    <div>
      <PageHeader title={t('comments')} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setSelectedIds(new Set());
            }}
            placeholder={tc('search')}
            aria-label={tc('search')}
            className="ps-9"
          />
        </div>
        <Select
          value={postId}
          onValueChange={(value) => {
            setPostId(value);
            setPage(1);
            setSelectedIds(new Set());
          }}
        >
          <SelectTrigger className="sm:w-72" aria-label={tc('filterByPost')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('allPosts')}</SelectItem>
            {postOptions.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {getLocalizedField(post, 'title', locale) || post.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v);
          setPage(1);
          setSelectedIds(new Set());
        }}
      >
        <TabsList className="mb-4">
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s === 'all' ? tc('allStatuses') : ts(s)}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUSES.map((s) => (
          <TabsContent key={s} value={s}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={selectVisible} disabled={!items.length}>
                {items.length > 0 && items.every((comment) => selectedIds.has(comment.id))
                  ? tc('clearSelection')
                  : tc('selectVisible')}
              </Button>
              {selectedIds.size ? (
                <>
                  <span className="text-sm text-muted-foreground" aria-live="polite">
                    {tc('selectedCount', { count: selectedIds.size })}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => void runBulkAction('APPROVED')}
                    disabled={bulkBusy}
                  >
                    {t('actions.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void runBulkAction('REJECTED')}
                    disabled={bulkBusy}
                  >
                    {t('actions.reject')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void runBulkAction('SPAM')}
                    disabled={bulkBusy}
                  >
                    {t('actions.spam')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={confirmBulkDelete}
                    disabled={bulkBusy}
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    {tc('deleteSelected')}
                  </Button>
                </>
              ) : null}
            </div>
            <DataTable
              isLoading={isLoading}
              isError={isError}
              onRetry={() => {
                void refetch();
              }}
              isEmpty={!isLoading && items.length === 0}
              items={items}
              mobileCardRender={(comment) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-9 w-9 shrink-0">
                        {comment.user.avatarUrl ? (
                          <AvatarImage src={getMediaUrl(comment.user.avatarUrl)} alt="" />
                        ) : null}
                        <AvatarFallback>
                          {(comment.user.displayName ?? comment.user.username).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {comment.user.displayName ?? comment.user.username}
                        </p>
                        {comment.user.email ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {comment.user.email}
                          </p>
                        ) : null}
                        <Link
                          href={`/${locale}/dashboard/posts/${comment.post.id}/edit`}
                          className="block truncate text-sm text-primary hover:underline"
                        >
                          {getLocalizedField(comment.post, 'title', locale) || comment.post.slug}
                        </Link>
                      </div>
                    </div>
                    <Badge
                      variant={STATUS_VARIANT[comment.status] ?? 'secondary'}
                      className="shrink-0"
                    >
                      {ts(comment.status as 'PENDING')}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(comment.id)}
                      onChange={() =>
                        setSelectedIds((current) => {
                          const next = new Set(current);
                          if (next.has(comment.id)) next.delete(comment.id);
                          else next.add(comment.id);
                          return next;
                        })
                      }
                      aria-label={tc('selectComment', {
                        name: comment.user.displayName ?? comment.user.username,
                      })}
                      className="accent-primary"
                    />
                    {tc('select')}
                  </label>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
                    <span>{tt('date')}</span>
                    <span>{formatDate(comment.createdAt, locale)}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openReply(comment)}>
                      <MessageCircleReply className="me-2 h-4 w-4" />
                      {tc('reply')}
                    </Button>
                    {comment.status === 'PENDING' ? (
                      <>
                        <Button size="sm" onClick={() => moderate(comment.id, 'APPROVED')}>
                          {t('actions.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => moderate(comment.id, 'REJECTED')}
                        >
                          {t('actions.reject')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => moderate(comment.id, 'SPAM')}
                        >
                          {t('actions.spam')}
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('actions.delete')}
                      onClick={() => handleDelete(comment)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={
                          items.length > 0 && items.every((comment) => selectedIds.has(comment.id))
                        }
                        onChange={selectVisible}
                        aria-label={tc('selectVisible')}
                        className="accent-primary"
                      />
                    </TableHead>
                    <TableHead>{tt('user')}</TableHead>
                    <TableHead>{tt('post')}</TableHead>
                    <TableHead>{tt('content')}</TableHead>
                    <TableHead>{tt('date')}</TableHead>
                    <TableHead className="text-end">{tt('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(comment.id)}
                          onChange={() =>
                            setSelectedIds((current) => {
                              const next = new Set(current);
                              if (next.has(comment.id)) next.delete(comment.id);
                              else next.add(comment.id);
                              return next;
                            })
                          }
                          aria-label={tc('selectComment', {
                            name: comment.user.displayName ?? comment.user.username,
                          })}
                          className="accent-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {comment.user.avatarUrl ? (
                              <AvatarImage src={getMediaUrl(comment.user.avatarUrl)} alt="" />
                            ) : null}
                            <AvatarFallback className="text-[10px]">
                              {(comment.user.displayName ?? comment.user.username).slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {comment.user.displayName ?? comment.user.username}
                            </p>
                            {comment.user.email ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {comment.user.email}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${locale}/dashboard/posts/${comment.post.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          {getLocalizedField(comment.post, 'title', locale) || comment.post.slug}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(comment.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReply(comment)}
                            aria-label={`${tc('reply')}: ${comment.user.displayName ?? comment.user.username}`}
                          >
                            <MessageCircleReply className="h-4 w-4" />
                          </Button>
                          {comment.status === 'PENDING' ? (
                            <>
                              <Button size="sm" onClick={() => moderate(comment.id, 'APPROVED')}>
                                {t('actions.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => moderate(comment.id, 'REJECTED')}
                              >
                                {t('actions.reject')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => moderate(comment.id, 'SPAM')}
                              >
                                {t('actions.spam')}
                              </Button>
                            </>
                          ) : (
                            <Badge variant={STATUS_VARIANT[comment.status] ?? 'secondary'}>
                              {ts(comment.status as 'PENDING')}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('actions.delete')}
                            onClick={() => handleDelete(comment)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={!!replyTarget}
        onOpenChange={(open) => {
          if (!open) setReplyTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tc('replyTo', {
                name: replyTarget?.user.displayName ?? replyTarget?.user.username ?? '',
              })}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={sendReply} className="space-y-4">
            <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
              {replyTarget?.content}
            </p>
            <FormField label={tc('reply')}>
              <Textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                maxLength={2000}
                rows={5}
                placeholder={tc('replyPlaceholder')}
                required
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReplyTarget(null)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={replySaving || !replyText.trim()}>
                {replySaving ? tc('sending') : tc('sendReply')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog />
    </div>
  );
}
