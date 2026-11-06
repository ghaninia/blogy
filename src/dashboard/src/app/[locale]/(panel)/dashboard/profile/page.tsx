'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Skeleton,
  useToast,
} from '@gh/ui';
import { RefreshCw } from 'lucide-react';
import { api, ApiError } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { ProfileFormView, type ProfileFormState } from '@/features/profile/components/profile-form';
import { useAuthStore } from '@/shared/store/auth';

export default function DashboardProfilePage() {
  const t = useTranslations('dashboard');
  const tp = useTranslations('dashboard.profilePage');
  const tt = useTranslations('dashboard.table');
  const locale = useLocale();
  const router = useRouter();
  const tToast = useTranslations('dashboard.toast');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const { user, isLoading, setUser } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  const [form, setForm] = useState<ProfileFormState>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    twitterUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadProfile = useCallback(() => {
    if (!user) return;

    setProfileLoading(true);
    setProfileError(false);
    setForm({
      displayName: user.displayName ?? '',
      bio: '',
      avatarUrl: user.avatarUrl ?? '',
      website: user.website ?? '',
      githubUrl: user.githubUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      instagramUrl: user.instagramUrl ?? '',
      twitterUrl: user.twitterUrl ?? '',
    });

    api
      .get<{
        bio?: string | null;
        avatarUrl?: string | null;
        website?: string | null;
        githubUrl?: string | null;
        linkedinUrl?: string | null;
        instagramUrl?: string | null;
        twitterUrl?: string | null;
      }>('/api/auth/me')
      .then((res) => {
        if (res.data) {
          setForm((current) => ({
            ...current,
            bio: res.data?.bio ?? '',
            avatarUrl: res.data?.avatarUrl ?? '',
            website: res.data?.website ?? '',
            githubUrl: res.data?.githubUrl ?? '',
            linkedinUrl: res.data?.linkedinUrl ?? '',
            instagramUrl: res.data?.instagramUrl ?? '',
            twitterUrl: res.data?.twitterUrl ?? '',
          }));
        }
      })
      .catch(() => setProfileError(true))
      .finally(() => setProfileLoading(false));
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch<typeof user>('/api/auth/profile', {
        displayName: form.displayName || undefined,
        bio: form.bio,
        avatarUrl: form.avatarUrl,
        website: form.website,
        githubUrl: form.githubUrl,
        linkedinUrl: form.linkedinUrl,
        instagramUrl: form.instagramUrl,
        twitterUrl: form.twitterUrl,
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

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: tp('passwordMismatch'), variant: 'destructive' });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordDialogOpen(false);
      toast({ title: tp('passwordChanged'), description: tp('signInAgain'), variant: 'success' });
      await logout();
      router.replace(`/${locale}/login`);
    } catch (err) {
      toast({
        title: tToast('error'),
        description: err instanceof ApiError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setPasswordSaving(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(true)}
              disabled={profileLoading}
            >
              {tp('changePassword')}
            </Button>
            <Button onClick={handleSave} disabled={saving || profileLoading}>
              {t('actions.save')}
            </Button>
          </div>
        }
      />

      {profileLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {profileError ? (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <span>{tt('loadError')}</span>
              <Button variant="outline" size="sm" onClick={loadProfile}>
                <RefreshCw className="me-2 h-4 w-4" />
                {tt('retry')}
              </Button>
            </div>
          ) : null}
          <ProfileFormView user={user} form={form} onChange={setForm} />
        </>
      )}

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tp('changePassword')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormField label={tp('currentPassword')}>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label={tp('newPassword')}>
              <Input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
              />
            </FormField>
            <FormField label={tp('confirmPassword')}>
              <Input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </FormField>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {tp('passwordRequirements')}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? tc('loading') : tp('changePassword')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
