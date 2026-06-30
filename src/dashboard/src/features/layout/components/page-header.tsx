import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_input]:w-full sm:[&_input]:w-auto [&_label]:w-full sm:[&_label]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
