'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, useToast } from '@gh/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { SiteSettingsFormView } from '@/features/settings/components/site-settings-form';
import {
  emptySiteSettings,
  formToSettingUpdates,
  settingsToForm,
  type SettingRecord,
  type SiteSettingsForm,
} from '@/features/settings/site-settings';

export default function DashboardSettingsPage() {
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.siteSettings');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<SiteSettingsForm>(emptySiteSettings());
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get<SettingRecord[]>('/api/settings');
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (items.length > 0) {
      setForm(settingsToForm(items));
    }
  }, [items]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = formToSettingUpdates(form);
      await Promise.all(updates.map((update) => api.put('/api/settings', update)));
      toast({ title: tToast('saved'), variant: 'success' });
      qc.invalidateQueries({ queryKey: ['settings'] });
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

  return (
    <div>
      <PageHeader
        title={t('settings')}
        description={ts('description')}
        action={
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {t('actions.save')}
          </Button>
        }
      />

      <SiteSettingsFormView form={form} onChange={setForm} isLoading={isLoading} />
    </div>
  );
}
