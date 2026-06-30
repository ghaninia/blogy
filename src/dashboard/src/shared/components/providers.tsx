'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, Toaster, TooltipProvider } from '@gh/ui';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <ThemeProvider>
      <ToastProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
