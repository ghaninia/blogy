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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api-client';
import { getLocalizedField, isAdmin } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';

interface PageItem {
  id: string;
  slug: string;
  type: string;
  titleFa?: string;
  titleEn?: string;
  isPublished: boolean;
}

export default function DashboardPagesPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const locale = useLocale();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { items, meta, isLoading } = useCrudList<PageItem>({
    queryKey: ['dashboard-pages'],
    endpoint: '/api/pages',
    params: {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    },
  });

  const handleDelete = (pageItem: PageItem) => {
    confirmDelete({
      description: t('confirm.deletePage'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/pages/${pageItem.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-pages'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const canDelete = user ? isAdmin(user.role) : false;

  const renderActions = (pageItem: PageItem) => (
    <div className="flex justify-end gap-2">
      <Link href={`/${locale}/dashboard/pages/${pageItem.id}/edit`}>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </Link>
      {canDelete ? (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(pageItem)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t('pages')}
        action={
          <Link href={`/${locale}/dashboard/pages/new`}>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t('newPage')}
            </Button>
          </Link>
        }
      />

      <div className="mb-4">
        <Input
          placeholder={tt('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
      </div>

      <DataTable
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        items={items}
        mobileCardRender={(pageItem) => (
          <div className="space-y-2">
            <div>
              <p className="font-medium">{getLocalizedField(pageItem, 'title', locale) || pageItem.slug}</p>
              <p className="text-xs text-muted-foreground">{pageItem.slug}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="secondary">{pageItem.type}</Badge>
                <Badge variant={pageItem.isPublished ? 'success' : 'secondary'}>
                  {pageItem.isPublished ? tt('published') : t('draft')}
                </Badge>
              </div>
            </div>
            {renderActions(pageItem)}
          </div>
        )}
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
              <TableHead>{tt('type')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((pageItem) => (
              <TableRow key={pageItem.id}>
                <TableCell>
                  <p className="font-medium">{getLocalizedField(pageItem, 'title', locale) || pageItem.slug}</p>
                  <p className="text-xs text-muted-foreground">{pageItem.slug}</p>
                </TableCell>
                <TableCell>{pageItem.type}</TableCell>
                <TableCell>
                  <Badge variant={pageItem.isPublished ? 'success' : 'secondary'}>
                    {pageItem.isPublished ? tt('published') : t('draft')}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">{renderActions(pageItem)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <DeleteDialog />
    </div>
  );
}
