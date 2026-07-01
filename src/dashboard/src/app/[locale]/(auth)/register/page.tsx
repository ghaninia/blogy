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

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const setUser = useAuthStore((s) => s.setUser);
  const { getToken } = useRecaptcha();

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
      const res = await api.post<{ user: { id: string; email: string; username: string; displayName: string | null; role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER'; avatarUrl: string | null } }>(
        '/api/auth/register',
        { ...form, recaptchaToken },
      );
      if (res.data?.user) setUser(res.data.user);
      router.push(`/${locale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t('registerTitle')}
      footer={
        <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
          {t('loginTitle')}
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
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </FormField>
        <FormField label={t('username')} htmlFor="username" required>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            autoComplete="username"
          />
        </FormField>
        <FormField label={t('displayName')} htmlFor="displayName">
          <Input
            id="displayName"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            autoComplete="name"
          />
        </FormField>
        <FormField label={t('password')} htmlFor="password" required>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
        </FormField>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {t('registerButton')}
        </Button>
      </form>
    </AuthCard>
  );
}
