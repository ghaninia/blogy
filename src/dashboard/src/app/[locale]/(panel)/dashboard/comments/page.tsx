'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Pagination,
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
  useToast,
} from '@gh/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api-client';
import { getLocalizedField, formatDate } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';

interface Comment {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  postId: string;
  user: { username: string; displayName?: string };
  post: { id: string; slug: string; titleEn?: string; titleFa?: string };
}

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'] as const;

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
  const { toast } = useToast();
  const locale = useLocale();
  const qc = useQueryClient();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [status, setStatus] = useState<string>('PENDING');
  const [page, setPage] = useState(1);

  const { items, meta, isLoading } = useCrudList<Comment>({
    queryKey: ['dashboard-comments', status],
    endpoint: '/api/comments',
    params: { status, page, limit: 20 },
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

      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <TabsList className="mb-4">
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>{ts(s)}</TabsTrigger>
          ))}
        </TabsList>

        {STATUSES.map((s) => (
          <TabsContent key={s} value={s}>
            <DataTable
              isLoading={isLoading}
              isEmpty={!isLoading && items.length === 0}
              footer={
                meta && meta.totalPages > 1 ? (
                  <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
                ) : undefined
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell>{comment.user.displayName ?? comment.user.username}</TableCell>
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
                          {comment.status === 'PENDING' ? (
                            <>
                              <Button size="sm" onClick={() => moderate(comment.id, 'APPROVED')}>
                                {t('actions.approve')}
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => moderate(comment.id, 'REJECTED')}>
                                {t('actions.reject')}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => moderate(comment.id, 'SPAM')}>
                                {t('actions.spam')}
                              </Button>
                            </>
                          ) : (
                            <Badge variant={STATUS_VARIANT[comment.status] ?? 'secondary'}>
                              {ts(comment.status as 'PENDING')}
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(comment)}>
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

      <DeleteDialog />
    </div>
  );
}
