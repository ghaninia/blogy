'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Textarea,
  useToast,
} from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { Header } from '@/features/layout/components/header';
import { useAuthStore } from '@/shared/store/auth';

export default function ProfilePage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tAuth = useTranslations('auth');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading, setUser } = useAuthStore();

  const [form, setForm] = useState({ displayName: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    } else if (user) {
      setForm({
        displayName: user.displayName ?? '',
        bio: '',
        avatarUrl: user.avatarUrl ?? '',
      });
      api.get<{ bio?: string }>('/api/auth/me').then((res) => {
        if (res.data?.bio) setForm((f) => ({ ...f, bio: res.data!.bio ?? '' }));
      }).catch(() => undefined);
    }
  }, [user, isLoading, router, locale]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch<typeof user>('/api/auth/profile', {
        displayName: form.displayName || undefined,
        bio: form.bio || undefined,
        avatarUrl: form.avatarUrl || undefined,
      });
      if (res.data) setUser(res.data);
      toast({ title: tToast('saved'), variant: 'success' });
    } catch (err) {
      toast({
        title: tToast('error'),
        description: err instanceof ApiError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-12">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label={tAuth('email')}>
                <Input value={user.email} disabled />
              </FormField>
              <FormField label={tAuth('username')}>
                <Input value={user.username} disabled />
              </FormField>
              <FormField label={tAuth('displayName')}>
                <Input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
              </FormField>
              <FormField label={tf('bio')}>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                />
              </FormField>
              <FormField label={tf('avatarUrl')}>
                <Input
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                />
              </FormField>
              <Button type="submit" disabled={saving}>{t('actions.save')}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
