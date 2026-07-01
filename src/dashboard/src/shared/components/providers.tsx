'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, Toaster, TooltipProvider } from '@gh/ui';
import { Suspense, useState, type ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { NavigationProgress } from './navigation-progress';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider>
      <ToastProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
