'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Skeleton,
  Switch,
  Textarea,
  useToast,
} from '@gh/ui';
import { api } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';

interface SettingRecord {
  key: string;
  valueFa?: string;
  valueEn?: string;
  valueJson?: Record<string, unknown> | null;
}

interface SeoForm {
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  canonicalUrl: string;
  robots: string;
  sitemapEnabled: boolean;
  structuredData: string;
}

const emptyForm: SeoForm = {
  titleFa: '',
  titleEn: '',
  descriptionFa: '',
  descriptionEn: '',
  canonicalUrl: '',
  robots: 'index, follow',
  sitemapEnabled: true,
  structuredData: '{\n  "@context": "https://schema.org",\n  "@type": "Person"\n}',
};

export default function DashboardSeoPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const ts = useTranslations('dashboard.seoPage');
  const tf = useTranslations('dashboard.form');
  const toastText = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SeoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const {
    data: settings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get<SettingRecord[]>('/api/settings');
      return response.data ?? [];
    },
  });

  useEffect(() => {
    if (!settings.length) return;
    const record = (key: string) => settings.find((setting) => setting.key === key);
    const title = record('meta_title');
    const description = record('meta_description');
    const sitemap = record('sitemap_enabled');
    const structured = record('structured_data');
    setForm((current) => ({
      ...current,
      titleFa: title?.valueFa ?? '',
      titleEn: title?.valueEn ?? '',
      descriptionFa: description?.valueFa ?? '',
      descriptionEn: description?.valueEn ?? '',
      canonicalUrl: record('canonical_url')?.valueEn ?? '',
      robots: record('robots')?.valueEn ?? current.robots,
      sitemapEnabled: sitemap?.valueEn !== 'false',
      structuredData: structured?.valueEn ?? current.structuredData,
    }));
  }, [settings]);

  const save = async () => {
    setValidationError('');
    let structuredData: Record<string, unknown>;
    try {
      structuredData = JSON.parse(form.structuredData) as Record<string, unknown>;
      if (Array.isArray(structuredData) || typeof structuredData !== 'object' || !structuredData) {
        throw new Error('Expected a JSON object');
      }
    } catch {
      setValidationError(ts('invalidJson'));
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        api.put('/api/settings', {
          key: 'meta_title',
          valueFa: form.titleFa,
          valueEn: form.titleEn,
        }),
        api.put('/api/settings', {
          key: 'meta_description',
          valueFa: form.descriptionFa,
          valueEn: form.descriptionEn,
        }),
        api.put('/api/settings', { key: 'canonical_url', valueEn: form.canonicalUrl }),
        api.put('/api/settings', { key: 'robots', valueEn: form.robots }),
        api.put('/api/settings', { key: 'sitemap_enabled', valueEn: String(form.sitemapEnabled) }),
        api.put('/api/settings', {
          key: 'structured_data',
          valueJson: structuredData,
          valueEn: form.structuredData,
        }),
      ]);
      toast({ title: toastText('saved'), variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const currentTitle = locale === 'fa' ? form.titleFa : form.titleEn;
  const currentDescription = locale === 'fa' ? form.descriptionFa : form.descriptionEn;
  const previewUrl = form.canonicalUrl || 'your-domain.example';

  return (
    <div>
      <PageHeader
        title={t('seo')}
        description={ts('description')}
        action={
          <Button onClick={save} disabled={saving || isLoading || isError}>
            {t('actions.save')}
          </Button>
        }
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card variant="glass">
          <CardContent className="py-12 text-center text-sm text-destructive" role="alert">
            {ts('loadError')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>{ts('searchAppearance')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label={tf('metaTitleFa')}>
                    <Input
                      maxLength={200}
                      value={form.titleFa}
                      onChange={(event) => setForm({ ...form, titleFa: event.target.value })}
                      dir="rtl"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{form.titleFa.length}/200</p>
                  </FormField>
                  <FormField label={tf('metaTitleEn')}>
                    <Input
                      maxLength={200}
                      value={form.titleEn}
                      onChange={(event) => setForm({ ...form, titleEn: event.target.value })}
                      dir="ltr"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{form.titleEn.length}/200</p>
                  </FormField>
                  <FormField label={tf('metaDescFa')}>
                    <Textarea
                      maxLength={300}
                      value={form.descriptionFa}
                      onChange={(event) => setForm({ ...form, descriptionFa: event.target.value })}
                      rows={4}
                      dir="rtl"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.descriptionFa.length}/300
                    </p>
                  </FormField>
                  <FormField label={tf('metaDescEn')}>
                    <Textarea
                      maxLength={300}
                      value={form.descriptionEn}
                      onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })}
                      rows={4}
                      dir="ltr"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.descriptionEn.length}/300
                    </p>
                  </FormField>
                </div>
                <FormField label={ts('canonicalUrl')}>
                  <Input
                    type="url"
                    value={form.canonicalUrl}
                    onChange={(event) => setForm({ ...form, canonicalUrl: event.target.value })}
                    placeholder="https://example.com/page"
                    dir="ltr"
                  />
                </FormField>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>{ts('indexing')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label={ts('robots')}>
                  <Textarea
                    value={form.robots}
                    onChange={(event) => setForm({ ...form, robots: event.target.value })}
                    rows={3}
                    dir="ltr"
                  />
                </FormField>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{ts('sitemap')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{ts('sitemapHint')}</p>
                  </div>
                  <Switch
                    checked={form.sitemapEnabled}
                    onCheckedChange={(value) => setForm({ ...form, sitemapEnabled: value })}
                    aria-label={ts('sitemap')}
                  />
                </div>
                <FormField label={ts('structuredData')}>
                  <Textarea
                    value={form.structuredData}
                    onChange={(event) => setForm({ ...form, structuredData: event.target.value })}
                    rows={7}
                    className="font-mono text-xs"
                    dir="ltr"
                  />
                  {validationError ? (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                      {validationError}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">{ts('structuredDataHint')}</p>
                  )}
                </FormField>
              </CardContent>
            </Card>
          </div>

          <Card variant="glass" className="xl:sticky xl:top-4">
            <CardHeader>
              <CardTitle>{ts('preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-surface p-4" dir="ltr">
                <p className="truncate text-xs text-muted-foreground">
                  {previewUrl.replace(/^https?:\/\//, '')}
                </p>
                <p className="mt-1 line-clamp-2 text-lg font-medium text-info">
                  {currentTitle || ts('previewTitle')}
                </p>
                <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {currentDescription || ts('previewDescription')}
                </p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{ts('previewLocaleNote')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
