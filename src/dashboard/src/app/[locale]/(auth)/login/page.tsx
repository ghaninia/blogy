'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button, FormField, Input } from '@gh/ui';
import { api } from '@/shared/api-client';
import { useAuthStore } from '@/shared/store/auth';
import { useRecaptcha } from '@/features/auth/components/recaptcha-provider';
import { AuthCard } from '@/features/auth/components/auth-card';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const setUser = useAuthStore((s) => s.setUser);
  const { getToken } = useRecaptcha();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recaptchaToken = await getToken('login');
      const res = await api.post<{ user: { id: string; email: string; username: string; displayName: string | null; role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER'; avatarUrl: string | null } }>(
        '/api/auth/login',
        { email, password, recaptchaToken },
      );
      if (res.data?.user) setUser(res.data.user);
      router.push(`/${locale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t('loginTitle')}
      footer={
        <Link href={`/${locale}/register`} className="font-medium text-primary hover:underline">
          {t('registerTitle')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <FormField label={t('email')} htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FormField>
        <FormField label={t('password')} htmlFor="password" required>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FormField>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {t('loginButton')}
        </Button>
      </form>
    </AuthCard>
  );
}
