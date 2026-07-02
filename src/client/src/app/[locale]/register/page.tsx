'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/layout/container';
import { useRecaptcha } from '@/components/auth/recaptcha-provider';
import { api, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

function RegisterForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const { getToken } = useRecaptcha();
  const isFa = locale === 'fa';

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recaptchaToken = await getToken('register');
      const res = await api.post<{ user: Parameters<typeof setUser>[0] }>('/api/auth/register', {
        ...form,
        displayName: form.displayName || undefined,
        recaptchaToken,
      });
      if (res.data?.user) setUser(res.data.user);
      const returnUrl = searchParams.get('returnUrl') || `/${locale}`;
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const returnUrl = searchParams.get('returnUrl') || `/${locale}`;

  return (
    <>
        <h1 className={cn('text-xl font-medium', isFa && 'font-fa')}>{t('registerTitle')}</h1>
        <p className={cn('mt-2 text-sm text-muted-foreground', isFa && 'font-fa')}>{t('registerSubtitle')}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {(['email', 'username', 'displayName', 'password'] as const).map((field) => (
            <label key={field} className="block space-y-2">
              <span className={cn('text-sm', isFa && 'font-fa')}>{t(field)}</span>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={field !== 'displayName'}
                autoComplete={field === 'password' ? 'new-password' : field}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50"
          >
            {loading ? t('loading') : t('registerButton')}
          </button>
        </form>

        <p className={cn('mt-6 text-sm text-muted-foreground', isFa && 'font-fa')}>
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {t('loginTitle')}
          </Link>
        </p>
    </>
  );
}

export default function RegisterPage() {
  const t = useTranslations('auth');

  return (
    <main className="py-16">
      <Container className="max-w-md">
        <Suspense fallback={<p className="text-sm text-muted-foreground">{t('loading')}</p>}>
          <RegisterForm />
        </Suspense>
      </Container>
    </main>
  );
}
