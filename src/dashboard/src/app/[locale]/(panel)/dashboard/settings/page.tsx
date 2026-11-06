'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@gh/ui';
import { Download, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, getPaginationMeta } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { SiteSettingsFormView } from '@/features/settings/components/site-settings-form';
import {
  emptySiteSettings,
  formToSettingUpdates,
  settingsToForm,
  type SettingRecord,
  type SiteSettingsForm,
} from '@/features/settings/site-settings';

const exportLimit = 100;

async function fetchAllRecords<T>(path: string): Promise<T[]> {
  const records: T[] = [];
  for (let page = 1; page <= 500; page += 1) {
    const response = await api.get<T[]>(path, { page, limit: exportLimit });
    const currentPage = response.data ?? [];
    records.push(...currentPage);
    const meta = getPaginationMeta(response);
    if (meta?.totalPages ? page >= meta.totalPages : currentPage.length < exportLimit) break;
    if (page === 500) throw new Error('Export exceeded the maximum supported page count');
  }
  return records;
}

export default function DashboardSettingsPage() {
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.siteSettings');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<SiteSettingsForm>(emptySiteSettings());
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const [posts, pages, categories, tags, portfolio, experiences, media] = await Promise.all([
        fetchAllRecords('/api/posts'),
        fetchAllRecords('/api/pages'),
        fetchAllRecords('/api/categories'),
        fetchAllRecords('/api/tags'),
        fetchAllRecords('/api/portfolio'),
        fetchAllRecords('/api/experiences'),
        fetchAllRecords('/api/media'),
      ]);
      const backup = {
        format: 'blogy-content-export',
        version: 1,
        exportedAt: new Date().toISOString(),
        includes: ['posts', 'pages', 'categories', 'tags', 'portfolio', 'experiences', 'media'],
        collections: { posts, pages, categories, tags, portfolio, experiences, media, settings: items },
      };
      const blobUrl = URL.createObjectURL(
        new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' }),
      );
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `blogy-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
      toast({ title: ts('backupDownloaded'), variant: 'success' });
    } catch {
      toast({ title: ts('backupError'), variant: 'destructive' });
    } finally {
      setExporting(false);
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
        <>
          <SiteSettingsFormView form={form} onChange={setForm} isLoading={isLoading} />
          {!isLoading ? (
            <Card variant="glass" className="mt-6">
              <CardHeader>
                <CardTitle>{ts('backupTitle')}</CardTitle>
                <p className="text-sm text-muted-foreground">{ts('backupDescription')}</p>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  {ts('backupPrivacyHint')}
                </p>
                <Button type="button" variant="outline" onClick={handleExport} disabled={exporting}>
                  <Download className="me-2 h-4 w-4" aria-hidden="true" />
                  {exporting ? ts('exportingBackup') : ts('exportBackup')}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
