'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent, useToast } from '@gh/ui';
import { RefreshCw } from 'lucide-react';
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
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<SiteSettingsForm>(emptySiteSettings());
  const [saving, setSaving] = useState(false);

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
      qc.invalidateQueries({ queryKey: ['site-settings'] });
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
          <Button onClick={handleSave} disabled={saving || isLoading || isError}>
            {t('actions.save')}
          </Button>
        }
      />

      {isError ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
            <p className="text-sm font-medium">{tt('loadError')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCw className="me-2 h-4 w-4" />
              {tt('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <SiteSettingsFormView form={form} onChange={setForm} isLoading={isLoading} />
      )}
    </div>
  );
}
