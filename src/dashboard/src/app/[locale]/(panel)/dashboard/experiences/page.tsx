'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
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
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';

interface ExperienceItem {
  id: string;
  titleFa: string;
  titleEn: string;
  companyFa: string;
  companyEn: string;
  startDate: string;
  endDate?: string | null;
  isPublished: boolean;
  sortOrder: number;
}

function formatPeriod(start: string, end: string | null | undefined, locale: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short' });
  if (!end) return `${fmt(start)} — ${locale === 'fa' ? 'اکنون' : 'Present'}`;
  return `${fmt(start)} — ${fmt(end)}`;
}

export default function DashboardExperiencesPage() {
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

  const { items, meta, isLoading } = useCrudList<ExperienceItem>({
    queryKey: ['dashboard-experiences'],
    endpoint: '/api/experiences',
    params: {
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
  });

  const handleDelete = (item: ExperienceItem) => {
    confirmDelete({
      description: t('confirm.deleteExperience'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/experiences/${item.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-experiences'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const renderActions = (item: ExperienceItem) => (
    <div className="flex justify-end gap-2">
      <Link href={`/${locale}/dashboard/experiences/${item.id}/edit`}>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </Link>
      {user && isAdmin(user.role) ? (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t('experiences')}
        action={
          <Link href={`/${locale}/dashboard/experiences/new`}>
            <Button><Plus className="me-2 h-4 w-4" />{t('newExperience')}</Button>
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
        mobileCardRender={(item) => (
          <div className="space-y-2">
            <div>
              <p className="font-medium">{getLocalizedField(item, 'title', locale)}</p>
              <p className="text-xs text-muted-foreground">{getLocalizedField(item, 'company', locale)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatPeriod(item.startDate, item.endDate, locale)}
              </p>
              <div className="mt-1 flex gap-2">
                <span className="text-xs text-muted-foreground">{tt('sortOrder')}: {item.sortOrder}</span>
                <Badge variant={item.isPublished ? 'success' : 'secondary'}>
                  {item.isPublished ? tt('published') : t('draft')}
                </Badge>
              </div>
            </div>
            {renderActions(item)}
          </div>
        )}
        pagination={{ page, meta, onPageChange: setPage }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt('title')}</TableHead>
              <TableHead>{tt('company')}</TableHead>
              <TableHead>{tt('period')}</TableHead>
              <TableHead>{tt('sortOrder')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium">{getLocalizedField(item, 'title', locale)}</p>
                </TableCell>
                <TableCell>{getLocalizedField(item, 'company', locale)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatPeriod(item.startDate, item.endDate, locale)}
                </TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  <Badge variant={item.isPublished ? 'success' : 'secondary'}>
                    {item.isPublished ? tt('published') : t('draft')}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">{renderActions(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <DeleteDialog />
    </div>
  );
}
