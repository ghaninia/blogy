'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@gh/ui';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  const locale = useLocale();

  return (
    <Card variant="glass" className="w-full max-w-md">
      <CardHeader className={cn('border-glass-border', locale === 'fa' && 'font-fa')}>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer ? (
        <div className="border-t border-glass-border px-6 py-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
