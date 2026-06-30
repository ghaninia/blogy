'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { api } from '@/shared/api-client';
import { getLocalizedField, isAdmin } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';
import { useQueryClient } from '@tanstack/react-query';

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

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['dashboard-pages'],
    queryFn: async () => {
      const res = await api.get<PageItem[]>('/api/pages');
      return res.data ?? [];
    },
  });

  const handleDelete = (page: PageItem) => {
    confirmDelete({
      description: t('confirm.deletePage'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/pages/${page.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-pages'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const canDelete = user ? isAdmin(user.role) : false;

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

      <DataTable isLoading={isLoading} isEmpty={!isLoading && items.length === 0}>
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
            {items.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <p className="font-medium">{getLocalizedField(page, 'title', locale) || page.slug}</p>
                  <p className="text-xs text-muted-foreground">{page.slug}</p>
                </TableCell>
                <TableCell>{page.type}</TableCell>
                <TableCell>
                  <Badge variant={page.isPublished ? 'success' : 'secondary'}>
                    {page.isPublished ? tt('published') : t('draft')}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Link href={`/${locale}/dashboard/pages/${page.id}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    {canDelete ? (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(page)}>
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
