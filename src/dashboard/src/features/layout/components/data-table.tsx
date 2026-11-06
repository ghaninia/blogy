'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, EmptyState, Skeleton, Button } from '@gh/ui';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  TablePagination,
  type TablePaginationProps,
} from '@/features/layout/components/table-pagination';

interface DataTableProps<T = unknown> {
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
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
  isError,
  onRetry,
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
        ) : isError && isEmpty ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center" role="alert">
            <p className="text-sm font-medium">{t('loadError')}</p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="me-2 h-4 w-4" />
                {t('retry')}
              </Button>
            ) : null}
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
            {isError ? (
              <div
                className="flex items-center justify-between gap-3 border-b border-destructive/15 bg-destructive/5 px-4 py-2.5 text-xs text-destructive"
                role="alert"
              >
                <span>{t('refreshError')}</span>
                {onRetry ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive"
                    onClick={onRetry}
                  >
                    <RefreshCw className="me-1.5 h-3.5 w-3.5" />
                    {t('retry')}
                  </Button>
                ) : null}
              </div>
            ) : null}
            {showMobileCards ? (
              <div className="divide-y divide-border md:hidden">
                {items!.map((item) => (
                  <div key={(item as { id?: string }).id ?? String(item)} className="p-4">
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
