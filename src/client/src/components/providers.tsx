'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { RecaptchaProvider } from '@/components/auth/recaptcha-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return <RecaptchaProvider>{children}</RecaptchaProvider>;
}
