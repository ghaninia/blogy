'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/features/layout/components/header';
import { api } from '@/shared/api-client';
import { useAuthStore } from '@/shared/store/auth';
import { useRecaptcha } from '@/features/auth/components/recaptcha-provider';
import { Button } from '@gh/ui';
import { Input } from '@gh/ui';
import { Card, CardContent, CardHeader } from '@gh/ui';

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
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <div>
                <label className="mb-1 block text-sm font-medium">{t('email')}</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('password')}</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {t('loginButton')}
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link href={`/${locale}/register`} className="text-primary-600 hover:underline">
                  {t('registerTitle')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
