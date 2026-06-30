'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, EmptyState, Skeleton } from '@gh/ui';

interface DataTableProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function DataTable({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  footer,
}: DataTableProps) {
  const t = useTranslations('dashboard.table');

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
            <div className="overflow-x-auto">{children}</div>
            {footer ? (
              <div className="flex justify-center border-t border-border p-4">{footer}</div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
