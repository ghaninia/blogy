'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gh/ui';
import { cn } from '@/shared/lib/utils';

export interface FormTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface FormTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: FormTabItem[];
  children: ReactNode;
  className?: string;
}

export function FormTabs({ value, onValueChange, items, children, className }: FormTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('space-y-6', className)}>
      <TabsList
        className={cn(
          'grid h-auto w-full grid-cols-2 gap-2 rounded-2xl p-2',
          'glass-strong border-glass-border bg-transparent shadow-none',
          items.length === 3 && 'sm:grid-cols-3',
          items.length >= 4 && 'sm:grid-cols-4',
        )}
      >
        {items.map(({ value: tabValue, label, icon: Icon }) => (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            className={cn(
              'group flex h-auto min-h-[2.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl',
              'border border-transparent px-3 py-2.5 text-xs font-medium text-muted-foreground',
              'transition-all hover:bg-accent/40 hover:text-foreground',
              'sm:min-h-[2.5rem] sm:flex-row sm:gap-2 sm:text-sm',
              'data-[state=active]:border-primary/25 data-[state=active]:bg-primary/12',
              'data-[state=active]:text-primary data-[state=active]:shadow-none',
              'data-[state=active]:elevated-primary data-[state=active]:font-semibold',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-70 transition-opacity group-data-[state=active]:opacity-100" aria-hidden />
            <span className="leading-tight">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function FormTabPanel({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <TabsContent
      value={value}
      className={cn('mt-0 animate-fade-in focus-visible:outline-none focus-visible:ring-0', className)}
    >
      {children}
    </TabsContent>
  );
}
