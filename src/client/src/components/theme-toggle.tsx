'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SegmentedControl } from '@/components/layout/segmented-control';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={cn('inline-block h-9 w-[6.5rem]', className)} aria-hidden />;
  }

  const current = (resolvedTheme ?? theme) === 'dark' ? 'dark' : 'light';

  return (
    <SegmentedControl
      className={className}
      layoutId="theme-toggle-indicator"
      value={theme === 'system' ? 'system' : current}
      onChange={(value) => setTheme(value)}
      options={[
        {
          value: 'light',
          label: <Sun className="h-3.5 w-3.5" strokeWidth={2} />,
          ariaLabel: t('lightMode'),
        },
        {
          value: 'dark',
          label: <Moon className="h-3.5 w-3.5" strokeWidth={2} />,
          ariaLabel: t('darkMode'),
        },
        {
          value: 'system',
          label: <Monitor className="h-3.5 w-3.5" strokeWidth={2} />,
          ariaLabel: t('systemMode'),
        },
      ]}
    />
  );
}
