'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
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

interface Tag {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
}

export default function DashboardTagsPage() {
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

  const { items, meta, isLoading } = useCrudList<Tag>({
    queryKey: ['tags'],
    endpoint: '/api/tags',
    params: {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    },
  });

  const handleDelete = (tag: Tag) => {
    confirmDelete({
      description: t('confirm.deleteTag'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/tags/${tag.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['tags'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const renderActions = (tag: Tag) => (
    <div className="flex justify-end gap-2">
      <Link href={`/${locale}/dashboard/tags/${tag.id}/edit`}>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </Link>
      {user && isAdmin(user.role) ? (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t('tags')}
        action={
          <Link href={`/${locale}/dashboard/tags/new`}>
            <Button><Plus className="me-2 h-4 w-4" />{t('newTag')}</Button>
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
        mobileCardRender={(tag) => (
          <div className="space-y-2">
            <div>
              <p className="font-medium">{getLocalizedField(tag, 'name', locale)}</p>
              <p className="text-xs text-muted-foreground">{tag.slug}</p>
            </div>
            {renderActions(tag)}
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
              <TableHead>{tt('name')}</TableHead>
              <TableHead>{tt('slug')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{getLocalizedField(tag, 'name', locale)}</TableCell>
                <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                <TableCell className="text-end">{renderActions(tag)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <DeleteDialog />
    </div>
  );
}
