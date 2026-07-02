'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/layout/container';
import { useRecaptcha } from '@/components/auth/recaptcha-provider';
import { api, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const { getToken } = useRecaptcha();
  const isFa = locale === 'fa';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnUrl = searchParams.get('returnUrl') || `/${locale}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recaptchaToken = await getToken('login');
      const res = await api.post<{ user: Parameters<typeof setUser>[0] }>('/api/auth/login', {
        email,
        password,
        recaptchaToken,
      });
      if (res.data?.user) setUser(res.data.user);
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={cn('text-xl font-medium', isFa && 'font-fa')}>{t('loginTitle')}</h1>
      <p className={cn('mt-2 text-sm text-muted-foreground', isFa && 'font-fa')}>{t('loginSubtitle')}</p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <label className="block space-y-2">
          <span className={cn('text-sm', isFa && 'font-fa')}>{t('email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </label>
        <label className="block space-y-2">
          <span className={cn('text-sm', isFa && 'font-fa')}>{t('password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? t('loading') : t('loginButton')}
        </button>
      </form>

      <p className={cn('mt-6 text-sm text-muted-foreground', isFa && 'font-fa')}>
        {t('noAccount')}{' '}
        <Link
          href={`/${locale}/register?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t('registerTitle')}
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  const t = useTranslations('auth');

  return (
    <main className="py-16">
      <Container className="max-w-md">
        <Suspense fallback={<p className="text-sm text-muted-foreground">{t('loading')}</p>}>
          <LoginForm />
        </Suspense>
      </Container>
    </main>
  );
}
