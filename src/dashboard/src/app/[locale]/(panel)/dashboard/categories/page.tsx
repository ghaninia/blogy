'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil } from 'lucide-react';
import { Button, Input, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@gh/ui';
import { getLocalizedField } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';

interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  parent?: { id: string; nameFa: string; nameEn: string };
}

export default function DashboardCategoriesPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { items, meta, isLoading } = useCrudList<Category>({
    queryKey: ['categories'],
    endpoint: '/api/categories',
    params: {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    },
  });

  const renderActions = (cat: Category) => (
    <Link href={`/${locale}/dashboard/categories/${cat.id}/edit`}>
      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title={t('categories')}
        action={
          <Link href={`/${locale}/dashboard/categories/new`}>
            <Button><Plus className="me-2 h-4 w-4" />{t('newCategory')}</Button>
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
        mobileCardRender={(cat) => (
          <div className="space-y-2">
            <div>
              <p className="font-medium">{getLocalizedField(cat, 'name', locale)}</p>
              <p className="text-xs text-muted-foreground">{cat.slug}</p>
              {cat.parent ? (
                <p className="text-xs text-muted-foreground">
                  {tt('parent')}: {getLocalizedField(cat.parent, 'name', locale)}
                </p>
              ) : null}
            </div>
            {renderActions(cat)}
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
              <TableHead>{tt('parent')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{getLocalizedField(cat, 'name', locale)}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-muted-foreground">
                  {cat.parent ? getLocalizedField(cat.parent, 'name', locale) : '—'}
                </TableCell>
                <TableCell className="text-end">{renderActions(cat)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
}
