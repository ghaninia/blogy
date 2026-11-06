'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Monitor, Palette, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton, useToast } from '@gh/ui';
import { api } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { ThemeSelector } from '@/features/layout/components/theme-selector';
import {
  accentPresets,
  homepageLayouts,
  isAccentPreset,
  isHomepageLayout,
  type AccentPreset,
  type HomepageLayout,
} from '@/features/appearance/presets';

interface SettingRecord {
  key: string;
  valueJson?: Record<string, unknown> | null;
}

export default function DashboardAppearancePage() {
  const t = useTranslations('dashboard');
  const ta = useTranslations('dashboard.appearancePage');
  const tt = useTranslations('dashboard.table');
  const toastText = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accent, setAccent] = useState<AccentPreset>('violet');
  const [homepageLayout, setHomepageLayout] = useState<HomepageLayout>('editorial');
  const [saving, setSaving] = useState(false);

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get<SettingRecord[]>('/api/settings');
      return response.data ?? [];
    },
  });

  useEffect(() => {
    const saved = data.find((setting) => setting.key === 'site_appearance')?.valueJson;
    if (isAccentPreset(saved?.accent)) setAccent(saved.accent);
    if (isHomepageLayout(saved?.homepageLayout)) setHomepageLayout(saved.homepageLayout);
  }, [data]);

  const applyAccent = (next: AccentPreset) => {
    document.documentElement.dataset.accent = next;
    localStorage.setItem('gh-accent', next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', {
        key: 'site_appearance',
        valueJson: { accent, homepageLayout },
      });
      applyAccent(accent);
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: toastText('saved'), variant: 'success' });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('appearance')}
        description={ta('description')}
        action={
          <Button onClick={save} disabled={saving || isLoading || isError}>
            {t('actions.save')}
          </Button>
        }
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
            <p className="text-sm">{tt('loadError')}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {tt('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <Palette className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">{ta('accentTitle')}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{ta('accentDescription')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {accentPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={accent === preset.id}
                  onClick={() => setAccent(preset.id)}
                  className="flex items-center gap-3 rounded-xl border border-border p-4 text-start transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: `hsl(${preset.hsl})` }}
                  >
                    {accent === preset.id ? (
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{ta(preset.id)}</span>
                    <span className="mt-1 flex gap-1.5" aria-hidden="true">
                      <span className="h-1.5 w-8 rounded-full bg-primary" />
                      <span className="h-1.5 w-5 rounded-full bg-muted" />
                      <span className="h-1.5 w-3 rounded-full bg-border" />
                    </span>
                  </span>
                  {accent === preset.id ? (
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <Monitor className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">{ta('themeTitle')}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{ta('themeDescription')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{ta('themePreference')}</span>
              <ThemeSelector />
            </CardContent>
          </Card>
        </div>
      )}
      {!isLoading && !isError ? (
        <Card variant="glass" className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">{ta('homeLayoutTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{ta('homeLayoutDescription')}</p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {homepageLayouts.map((layout) => (
              <button
                key={layout}
                type="button"
                aria-pressed={homepageLayout === layout}
                onClick={() => setHomepageLayout(layout)}
                className="rounded-xl border border-border p-4 text-start transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/5"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{ta(layout)}</span>
                  {homepageLayout === layout ? (
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  ) : null}
                </span>
                <span className="mt-3 grid gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`block h-2 rounded-full ${index === 0 ? 'w-full bg-primary/60' : index === 1 ? 'w-4/5 bg-muted' : 'w-3/5 bg-muted'}`}
                    />
                  ))}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
