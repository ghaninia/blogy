'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

function isInternalNavigation(href: string, pathname: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return false;
  }
  const target = href.split('?')[0];
  return target !== pathname;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || !isInternalNavigation(href, pathname)) {
        return;
      }

      setActive(true);
      setVisible(true);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  useEffect(() => {
    setActive(false);
    const timer = window.setTimeout(() => setVisible(false), 250);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <>
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-[200] h-1 overflow-hidden bg-primary/10',
        )}
        aria-hidden
      >
        <div
          className={cn(
            'h-full bg-primary transition-all duration-300 ease-out',
            active ? 'w-2/3 animate-pulse' : 'w-full',
          )}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-[190] bg-background/20 backdrop-blur-[1px] transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      />
    </>
  );
}
