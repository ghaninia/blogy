'use client';

import { useTranslations } from 'next-intl';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Textarea,
} from '@gh/ui';
import type { AuthUser } from '@gh/backend/types';

export interface ProfileFormState {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

interface ProfileFormProps {
  user: AuthUser;
  form: ProfileFormState;
  onChange: (form: ProfileFormState) => void;
}

export function ProfileFormView({ user, form, onChange }: ProfileFormProps) {
  const t = useTranslations('dashboard');
  const tp = useTranslations('dashboard.profilePage');
  const tf = useTranslations('dashboard.form');
  const tAuth = useTranslations('auth');

  const set = (patch: Partial<ProfileFormState>) => onChange({ ...form, ...patch });

  const initials =
    form.displayName?.slice(0, 2) ?? user.displayName?.slice(0, 2) ?? user.username?.slice(0, 2) ?? '?';

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle>{tp('account')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label={tAuth('email')}>
            <Input value={user.email} disabled />
          </FormField>
          <FormField label={tAuth('username')}>
            <Input value={user.username} disabled />
          </FormField>
          <FormField label={t('table.role')}>
            <Input value={user.role} disabled />
          </FormField>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>{tp('publicProfile')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 md:col-span-2">
            <Avatar className="h-16 w-16 border border-glass-border">
              {form.avatarUrl ? (
                <AvatarImage src={form.avatarUrl} alt={form.displayName || user.username} />
              ) : null}
              <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{tp('avatarHint')}</p>
          </div>
          <FormField label={tAuth('displayName')}>
            <Input
              value={form.displayName}
              onChange={(e) => set({ displayName: e.target.value })}
            />
          </FormField>
          <FormField label={tf('avatarUrl')}>
            <Input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => set({ avatarUrl: e.target.value })}
              dir="ltr"
              placeholder="https://"
            />
          </FormField>
          <FormField label={tf('bio')} className="md:col-span-2">
            <Textarea
              value={form.bio}
              onChange={(e) => set({ bio: e.target.value })}
              rows={4}
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}
