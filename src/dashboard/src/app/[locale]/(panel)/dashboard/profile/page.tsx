'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Skeleton, useToast } from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import {
  ProfileFormView,
  type ProfileFormState,
} from '@/features/profile/components/profile-form';
import { useAuthStore } from '@/shared/store/auth';

export default function DashboardProfilePage() {
  const t = useTranslations('dashboard');
  const tp = useTranslations('dashboard.profilePage');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const { user, isLoading, setUser } = useAuthStore();

  const [form, setForm] = useState<ProfileFormState>({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      displayName: user.displayName ?? '',
      bio: '',
      avatarUrl: user.avatarUrl ?? '',
    });

    setProfileLoading(true);
    api
      .get<{ bio?: string }>('/api/auth/me')
      .then((res) => {
        if (res.data?.bio) {
          setForm((current) => ({ ...current, bio: res.data!.bio ?? '' }));
        }
      })
      .catch(() => undefined)
      .finally(() => setProfileLoading(false));
  }, [user]);

  const handleSave = async () => {
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

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('profile')}
        description={tp('description')}
        action={
          <Button onClick={handleSave} disabled={saving || profileLoading}>
            {t('actions.save')}
          </Button>
        }
      />

      {profileLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : (
        <ProfileFormView user={user} form={form} onChange={setForm} />
      )}
    </div>
  );
}
