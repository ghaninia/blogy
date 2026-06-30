'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@gh/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api-client';
import { getLocalizedField } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';

interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  children?: Category[];
}

function CategoryTree({
  categories,
  locale,
  depth = 0,
}: {
  categories: Category[];
  locale: string;
  depth?: number;
}) {
  return (
    <>
      {categories.map((cat) => (
        <div key={cat.id}>
          <div
            className="flex items-center justify-between border-b border-border/50 px-6 py-3 last:border-0"
            style={{ paddingInlineStart: `${depth * 24 + 24}px` }}
          >
            <div>
              <p className="font-medium">{getLocalizedField(cat, 'name', locale)}</p>
              <p className="text-xs text-muted-foreground">{cat.slug}</p>
            </div>
            <Link href={`/${locale}/dashboard/categories/${cat.id}/edit`}>
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
            </Link>
          </div>
          {cat.children?.length ? (
            <CategoryTree categories={cat.children} locale={locale} depth={depth + 1} />
          ) : null}
        </div>
      ))}
    </>
  );
}

export default function DashboardCategoriesPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const { data = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories');
      return res.data ?? [];
    },
  });

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

      <DataTable isLoading={isLoading} isEmpty={!isLoading && data.length === 0}>
        <CategoryTree categories={data} locale={locale} />
      </DataTable>
    </div>
  );
}
