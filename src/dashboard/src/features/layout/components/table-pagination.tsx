'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Pagination } from '@gh/ui';
import type { PaginationMeta } from '@/shared/api-client';

export interface TablePaginationProps {
  page: number;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, meta, onPageChange }: TablePaginationProps) {
  const locale = useLocale();
  const tp = useTranslations('pagination');
  const tt = useTranslations('dashboard.table');

  if (!meta || meta.total === 0) return null;

  const from = (page - 1) * meta.limit + 1;
  const to = Math.min(page * meta.limit, meta.total);
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {tt('showing', { from, to, total: meta.total })}
        {meta.totalPages > 1 ? (
          <span className="hidden sm:inline">
            {' '}
            · {tp('page')} {page} {tp('of')} {meta.totalPages}
          </span>
        ) : null}
      </p>
      {meta.totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
          previousLabel={tp('previous')}
          nextLabel={tp('next')}
          dir={dir}
        />
      ) : null}
    </div>
  );
}
