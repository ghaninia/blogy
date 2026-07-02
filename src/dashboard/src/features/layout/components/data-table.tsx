'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, EmptyState, Skeleton } from '@gh/ui';
import { cn } from '@/shared/lib/utils';
import {
  TablePagination,
  type TablePaginationProps,
} from '@/features/layout/components/table-pagination';

interface DataTableProps<T = unknown> {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  pagination?: TablePaginationProps;
  items?: T[];
  mobileCardRender?: (item: T) => ReactNode;
}

export function DataTable<T = unknown>({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  footer,
  pagination,
  items,
  mobileCardRender,
}: DataTableProps<T>) {
  const t = useTranslations('dashboard.table');
  const showMobileCards = Boolean(mobileCardRender && items);

  return (
    <Card variant="glass">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            title={emptyTitle ?? t('empty')}
            description={emptyDescription}
            action={emptyAction}
            className="py-12"
          />
        ) : (
          <>
            {showMobileCards ? (
              <div className="divide-y divide-border md:hidden">
                {items!.map((item) => (
                  <div
                    key={(item as { id?: string }).id ?? String(item)}
                    className="p-4"
                  >
                    {mobileCardRender!(item)}
                  </div>
                ))}
              </div>
            ) : null}
            <div className={cn('overflow-x-auto', showMobileCards && 'hidden md:block')}>
              {children}
            </div>
            {pagination ? (
              <div className="border-t border-border p-4">
                <TablePagination {...pagination} />
              </div>
            ) : footer ? (
              <div className="flex justify-center border-t border-border p-4">{footer}</div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
