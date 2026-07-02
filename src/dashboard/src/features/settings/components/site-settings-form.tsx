'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Skeleton,
  Textarea,
} from '@gh/ui';
import { getMediaUrl } from '@/shared/api-client';
import { MediaManager, type MediaItem } from '@/features/media/components/media-manager';
import type { SiteSettingsForm } from '@/features/settings/site-settings';

interface SiteSettingsFormProps {
  form: SiteSettingsForm;
  onChange: (form: SiteSettingsForm) => void;
  isLoading?: boolean;
}

type MediaTarget = 'logo' | 'favicon' | 'ogImage';

function ImagePicker({
  label,
  path,
  onSelect,
  onRemove,
  selectLabel,
  removeLabel,
  previewClassName = 'h-16 w-16',
}: {
  label: string;
  path: string;
  onSelect: () => void;
  onRemove: () => void;
  selectLabel: string;
  removeLabel: string;
  previewClassName?: string;
}) {
  return (
    <FormField label={label}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {path ? (
          <div className={`relative overflow-hidden rounded-lg border bg-muted/30 ${previewClassName}`}>
            <Image src={getMediaUrl(path)} alt="" fill className="object-contain p-1" unoptimized />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onSelect}>
            {selectLabel}
          </Button>
          {path ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              {removeLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}

export function SiteSettingsFormView({ form, onChange, isLoading }: SiteSettingsFormProps) {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const ts = useTranslations('dashboard.siteSettings');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>('logo');

  const set = (patch: Partial<SiteSettingsForm>) => onChange({ ...form, ...patch });

  const openMedia = (target: MediaTarget) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (mediaTarget === 'logo') set({ logoPath: media.path });
    else if (mediaTarget === 'favicon') set({ faviconPath: media.path });
    else set({ ogImagePath: media.path });
    setMediaOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>{ts('identity')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label={ts('siteTitleFa')}>
              <Input value={form.siteNameFa} onChange={(e) => set({ siteNameFa: e.target.value })} />
            </FormField>
            <FormField label={ts('siteTitleEn')}>
              <Input value={form.siteNameEn} onChange={(e) => set({ siteNameEn: e.target.value })} />
            </FormField>
            <FormField label={ts('subtitleFa')}>
              <Input value={form.siteSubtitleFa} onChange={(e) => set({ siteSubtitleFa: e.target.value })} />
            </FormField>
            <FormField label={ts('subtitleEn')}>
              <Input value={form.siteSubtitleEn} onChange={(e) => set({ siteSubtitleEn: e.target.value })} />
            </FormField>
            <FormField label={ts('descriptionFa')} className="md:col-span-2">
              <Textarea
                value={form.siteDescriptionFa}
                onChange={(e) => set({ siteDescriptionFa: e.target.value })}
                rows={4}
                dir="rtl"
              />
            </FormField>
            <FormField label={ts('descriptionEn')} className="md:col-span-2">
              <Textarea
                value={form.siteDescriptionEn}
                onChange={(e) => set({ siteDescriptionEn: e.target.value })}
                rows={4}
              />
            </FormField>
            <ImagePicker
              label={ts('logo')}
              path={form.logoPath}
              onSelect={() => openMedia('logo')}
              onRemove={() => set({ logoPath: '' })}
              selectLabel={ts('selectLogo')}
              removeLabel={t('actions.removeCover')}
              previewClassName="h-20 w-40"
            />
            <ImagePicker
              label={ts('favicon')}
              path={form.faviconPath}
              onSelect={() => openMedia('favicon')}
              onRemove={() => set({ faviconPath: '' })}
              selectLabel={ts('selectFavicon')}
              removeLabel={t('actions.removeCover')}
              previewClassName="h-12 w-12"
            />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>{tf('seo')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('metaTitleFa')}>
              <Input value={form.metaTitleFa} onChange={(e) => set({ metaTitleFa: e.target.value })} />
            </FormField>
            <FormField label={tf('metaTitleEn')}>
              <Input value={form.metaTitleEn} onChange={(e) => set({ metaTitleEn: e.target.value })} />
            </FormField>
            <FormField label={tf('metaDescFa')}>
              <Textarea value={form.metaDescFa} onChange={(e) => set({ metaDescFa: e.target.value })} rows={3} />
            </FormField>
            <FormField label={tf('metaDescEn')}>
              <Textarea value={form.metaDescEn} onChange={(e) => set({ metaDescEn: e.target.value })} rows={3} />
            </FormField>
            <FormField label={ts('keywordsFa')}>
              <Input
                value={form.metaKeywordsFa}
                onChange={(e) => set({ metaKeywordsFa: e.target.value })}
                placeholder={ts('keywordsPlaceholder')}
              />
            </FormField>
            <FormField label={ts('keywordsEn')}>
              <Input
                value={form.metaKeywordsEn}
                onChange={(e) => set({ metaKeywordsEn: e.target.value })}
                placeholder={ts('keywordsPlaceholder')}
              />
            </FormField>
            <ImagePicker
              label={ts('ogImage')}
              path={form.ogImagePath}
              onSelect={() => openMedia('ogImage')}
              onRemove={() => set({ ogImagePath: '' })}
              selectLabel={ts('selectOgImage')}
              removeLabel={t('actions.removeCover')}
              previewClassName="h-24 w-44"
            />
            <FormField label={ts('siteUrl')}>
              <Input
                type="url"
                value={form.siteUrl}
                onChange={(e) => set({ siteUrl: e.target.value })}
                placeholder="https://example.com"
                dir="ltr"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>{ts('footer')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label={ts('copyrightFa')} className="md:col-span-2">
              <Input
                value={form.copyrightFa}
                onChange={(e) => set({ copyrightFa: e.target.value })}
                placeholder={ts('copyrightPlaceholder')}
                dir="rtl"
              />
            </FormField>
            <FormField label={ts('copyrightEn')} className="md:col-span-2">
              <Input
                value={form.copyrightEn}
                onChange={(e) => set({ copyrightEn: e.target.value })}
                placeholder={ts('copyrightPlaceholder')}
              />
            </FormField>
            <FormField label={ts('copyrightRightsFa')} className="md:col-span-2">
              <Input
                value={form.copyrightRightsFa}
                onChange={(e) => set({ copyrightRightsFa: e.target.value })}
                dir="rtl"
              />
            </FormField>
            <FormField label={ts('copyrightRightsEn')} className="md:col-span-2">
              <Input
                value={form.copyrightRightsEn}
                onChange={(e) => set({ copyrightRightsEn: e.target.value })}
              />
            </FormField>
            <p className="md:col-span-2 text-xs leading-relaxed text-muted-foreground">{ts('copyrightHint')}</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>{ts('advanced')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label={ts('twitterHandle')}>
              <Input
                value={form.twitterHandle}
                onChange={(e) => set({ twitterHandle: e.target.value })}
                placeholder="@username"
                dir="ltr"
              />
            </FormField>
            <FormField label={ts('googleVerification')}>
              <Input
                value={form.googleVerification}
                onChange={(e) => set({ googleVerification: e.target.value })}
                placeholder="google-site-verification=..."
                dir="ltr"
              />
            </FormField>
            <FormField label={ts('robots')} className="md:col-span-2">
              <Input
                value={form.robots}
                onChange={(e) => set({ robots: e.target.value })}
                placeholder="index, follow"
                dir="ltr"
              />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <MediaManager open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={handleMediaSelect} />
    </>
  );
}
