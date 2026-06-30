'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@gh/ui';
import { getMediaUrl } from '@/shared/api-client';
import { SlugField } from '@/shared/components/slug-field';
import { RichTextEditor } from '@/features/posts/components/rich-text-editor';
import { MediaManager } from '@/features/media/components/media-manager';

export interface PageFormData {
  slug: string;
  type: 'ABOUT' | 'CONTACT' | 'RESUME' | 'CUSTOM';
  titleFa: string;
  titleEn: string;
  contentFa: string;
  contentEn: string;
  isPublished: boolean;
  metaTitleFa: string;
  metaTitleEn: string;
  metaDescFa: string;
  metaDescEn: string;
}

export const emptyPageForm = (): PageFormData => ({
  slug: '',
  type: 'CUSTOM',
  titleFa: '',
  titleEn: '',
  contentFa: '',
  contentEn: '',
  isPublished: false,
  metaTitleFa: '',
  metaTitleEn: '',
  metaDescFa: '',
  metaDescEn: '',
});

interface PageFormProps {
  form: PageFormData;
  onChange: (form: PageFormData) => void;
  autoSlug?: boolean;
}

export function PageForm({ form, onChange, autoSlug = true }: PageFormProps) {
  const tf = useTranslations('dashboard.form');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'fa' | 'en'>('fa');

  const set = (patch: Partial<PageFormData>) => onChange({ ...form, ...patch });

  return (
    <>
      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label={tf('pageType')}>
            <Select value={form.type} onValueChange={(v) => set({ type: v as PageFormData['type'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                <SelectItem value="ABOUT">ABOUT</SelectItem>
                <SelectItem value="CONTACT">CONTACT</SelectItem>
                <SelectItem value="RESUME">RESUME</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label={tf('titleFa')}>
              <Input value={form.titleFa} onChange={(e) => set({ titleFa: e.target.value })} />
            </FormField>
            <FormField label={tf('titleEn')}>
              <Input value={form.titleEn} onChange={(e) => set({ titleEn: e.target.value })} />
            </FormField>
          </div>
          <SlugField
            slug={form.slug}
            titleEn={form.titleEn}
            onSlugChange={(slug) => set({ slug })}
            autoSync={autoSlug}
            randomPrefix="page"
            required
          />
          <FormField label={tf('isPublished')}>
            <Switch checked={form.isPublished} onCheckedChange={(v) => set({ isPublished: v })} />
          </FormField>
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('contentFa')}</CardTitle></CardHeader>
        <CardContent>
          <RichTextEditor
            content={form.contentFa}
            onChange={(html) => set({ contentFa: html })}
            onImageRequest={() => { setMediaTarget('fa'); setMediaOpen(true); }}
          />
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('contentEn')}</CardTitle></CardHeader>
        <CardContent>
          <RichTextEditor
            content={form.contentEn}
            onChange={(html) => set({ contentEn: html })}
            onImageRequest={() => { setMediaTarget('en'); setMediaOpen(true); }}
          />
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('seo')}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label={tf('metaTitleFa')}>
            <Input value={form.metaTitleFa} onChange={(e) => set({ metaTitleFa: e.target.value })} />
          </FormField>
          <FormField label={tf('metaTitleEn')}>
            <Input value={form.metaTitleEn} onChange={(e) => set({ metaTitleEn: e.target.value })} />
          </FormField>
          <FormField label={tf('metaDescFa')}>
            <Textarea value={form.metaDescFa} onChange={(e) => set({ metaDescFa: e.target.value })} rows={2} />
          </FormField>
          <FormField label={tf('metaDescEn')}>
            <Textarea value={form.metaDescEn} onChange={(e) => set({ metaDescEn: e.target.value })} rows={2} />
          </FormField>
        </CardContent>
      </Card>

      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          const img = `<img src="${getMediaUrl(media.path)}" alt="${media.originalName}" />`;
          const key = mediaTarget === 'fa' ? 'contentFa' : 'contentEn';
          set({ [key]: form[key] + img });
        }}
      />
    </>
  );
}

export function pageToForm(page: Record<string, unknown>): PageFormData {
  return {
    slug: (page.slug as string) ?? '',
    type: (page.type as PageFormData['type']) ?? 'CUSTOM',
    titleFa: (page.titleFa as string) ?? '',
    titleEn: (page.titleEn as string) ?? '',
    contentFa: (page.contentFa as string) ?? '',
    contentEn: (page.contentEn as string) ?? '',
    isPublished: (page.isPublished as boolean) ?? false,
    metaTitleFa: (page.metaTitleFa as string) ?? '',
    metaTitleEn: (page.metaTitleEn as string) ?? '',
    metaDescFa: (page.metaDescFa as string) ?? '',
    metaDescEn: (page.metaDescEn as string) ?? '',
  };
}

export function formToPagePayload(form: PageFormData) {
  return {
    slug: form.slug,
    type: form.type,
    titleFa: form.titleFa || undefined,
    titleEn: form.titleEn || undefined,
    contentFa: form.contentFa || undefined,
    contentEn: form.contentEn || undefined,
    isPublished: form.isPublished,
    metaTitleFa: form.metaTitleFa || undefined,
    metaTitleEn: form.metaTitleEn || undefined,
    metaDescFa: form.metaDescFa || undefined,
    metaDescEn: form.metaDescEn || undefined,
  };
}
