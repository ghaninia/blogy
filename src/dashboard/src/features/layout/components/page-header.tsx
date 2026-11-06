'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const locale = useLocale();
  const faFont = locale === 'fa';

  return (
    <div className="dashboard-page-header mb-7 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className={cn(faFont && 'font-fa')}>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_input]:w-full sm:[&_input]:w-auto [&_label]:w-full sm:[&_label]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
