'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  Pagination,
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
import { api } from '@/shared/api-client';
import { getLocalizedField, formatDate, canDeletePost } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';
import { useQueryClient } from '@tanstack/react-query';

interface Post {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  status: string;
  publishedAt?: string;
  author?: { displayName?: string; username: string };
}

const STATUS_VARIANT: Record<string, 'secondary' | 'success' | 'warning'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  SCHEDULED: 'warning',
};

export default function DashboardPostsPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const tToast = useTranslations('dashboard.toast');
  const { toast: showToast } = useToast();
  const locale = useLocale();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const { items, meta, isLoading } = useCrudList<Post>({
    queryKey: ['dashboard-posts'],
    endpoint: '/api/posts',
    params: {
      page,
      limit: 20,
      search: search || undefined,
      status: status === 'all' ? undefined : status,
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
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        searchPlaceholder={tt('search')}
        statusLabel={tt('status')}
        ts={ts}
      />

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
              <TableHead>{tt('title')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead>{tt('date')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((post) => (
              <TableRow key={post.id}>
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
      </DataTable>

      <DeleteDialog />
    </div>
  );
}

function CardFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  searchPlaceholder,
  statusLabel,
  ts,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  searchPlaceholder: string;
  statusLabel: string;
  ts: ReturnType<typeof useTranslations<'status'>>;
}) {
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
        </SelectContent>
      </Select>
    </div>
  );
}
