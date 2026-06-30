'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@gh/ui';
import { api, getMediaUrl } from '@/shared/api-client';
import { getLocalizedField } from '@/shared/lib/localized';
import { RichTextEditor } from '@/features/posts/components/rich-text-editor';
import { MediaManager } from '@/features/media/components/media-manager';

export interface PostFormData {
  slug: string;
  titleFa: string;
  titleEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa: string;
  contentEn: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt: string;
  coverMediaId: string;
  categoryIds: string[];
  tagIds: string[];
  metaTitleFa: string;
  metaTitleEn: string;
  metaDescFa: string;
  metaDescEn: string;
}

interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  children?: Category[];
}

interface Tag {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
}

interface PostFormProps {
  locale: string;
  form: PostFormData;
  onChange: (form: PostFormData) => void;
  coverPath?: string;
}

export const emptyPostForm = (): PostFormData => ({
  slug: '',
  titleFa: '',
  titleEn: '',
  excerptFa: '',
  excerptEn: '',
  contentFa: '',
  contentEn: '',
  status: 'DRAFT',
  publishedAt: '',
  coverMediaId: '',
  categoryIds: [],
  tagIds: [],
  metaTitleFa: '',
  metaTitleEn: '',
  metaDescFa: '',
  metaDescEn: '',
});

function flattenCategories(cats: Category[], depth = 0): { id: string; label: string }[] {
  return cats.flatMap((cat) => [
    { id: cat.id, label: `${'—'.repeat(depth)} ${cat.nameEn || cat.slug}` },
    ...(cat.children ? flattenCategories(cat.children, depth + 1) : []),
  ]);
}

export function PostForm({ locale, form, onChange, coverPath }: PostFormProps) {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const ts = useTranslations('status');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'fa' | 'en'>('cover');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories');
      return res.data ?? [];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get<Tag[]>('/api/tags');
      return res.data ?? [];
    },
  });

  const set = (patch: Partial<PostFormData>) => onChange({ ...form, ...patch });

  const toggleId = (key: 'categoryIds' | 'tagIds', id: string) => {
    const current = form[key];
    set({
      [key]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    });
  };

  return (
    <>
      <Card variant="glass" className="mb-6">
        <CardHeader>
          <CardTitle>{tf('basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label={tf('slug')} required>
            <Input
              value={form.slug}
              onChange={(e) => set({ slug: e.target.value })}
              placeholder="my-post"
              required
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('titleFa')}>
              <Input value={form.titleFa} onChange={(e) => set({ titleFa: e.target.value })} />
            </FormField>
            <FormField label={tf('titleEn')}>
              <Input value={form.titleEn} onChange={(e) => set({ titleEn: e.target.value })} />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('excerptFa')}>
              <Textarea value={form.excerptFa} onChange={(e) => set({ excerptFa: e.target.value })} rows={3} />
            </FormField>
            <FormField label={tf('excerptEn')}>
              <Textarea value={form.excerptEn} onChange={(e) => set({ excerptEn: e.target.value })} rows={3} />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('status')}>
              <Select value={form.status} onValueChange={(v) => set({ status: v as PostFormData['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{ts('DRAFT')}</SelectItem>
                  <SelectItem value="PUBLISHED">{ts('PUBLISHED')}</SelectItem>
                  <SelectItem value="SCHEDULED">{ts('SCHEDULED')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {form.status === 'SCHEDULED' ? (
              <FormField label={tf('publishedAt')}>
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => set({ publishedAt: e.target.value })}
                />
              </FormField>
            ) : null}
          </div>
          <FormField label={tf('cover')}>
            <div className="flex items-center gap-4">
              {coverPath ? (
                <div className="relative h-20 w-32 overflow-hidden rounded-lg border">
                  <Image src={getMediaUrl(coverPath)} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : null}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setMediaTarget('cover'); setMediaOpen(true); }}>
                  {t('actions.selectCover')}
                </Button>
                {form.coverMediaId ? (
                  <Button type="button" variant="ghost" onClick={() => set({ coverMediaId: '' })}>
                    {t('actions.removeCover')}
                  </Button>
                ) : null}
              </div>
            </div>
          </FormField>
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('contentFa')}</CardTitle></CardHeader>
        <CardContent>
          <RichTextEditor
            content={form.contentFa}
            onChange={(html) => set({ contentFa: html })}
            placeholder="..."
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
            placeholder="..."
            onImageRequest={() => { setMediaTarget('en'); setMediaOpen(true); }}
          />
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card variant="glass">
          <CardHeader><CardTitle>{tf('categories')}</CardTitle></CardHeader>
          <CardContent className="max-h-48 space-y-2 overflow-y-auto">
            {flattenCategories(categories).map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.categoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleId('categoryIds', cat.id)}
                />
                {cat.label}
              </label>
            ))}
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardHeader><CardTitle>{tf('tags')}</CardTitle></CardHeader>
          <CardContent className="max-h-48 space-y-2 overflow-y-auto">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.tagIds.includes(tag.id)}
                  onCheckedChange={() => toggleId('tagIds', tag.id)}
                />
                {getLocalizedField(tag, 'name', locale)}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

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
          if (mediaTarget === 'cover') {
            set({ coverMediaId: media.id });
          } else {
            const img = `<img src="${getMediaUrl(media.path)}" alt="${media.originalName}" />`;
            const key = mediaTarget === 'fa' ? 'contentFa' : 'contentEn';
            set({ [key]: form[key] + img });
          }
        }}
      />
    </>
  );
}

export function postToForm(post: Record<string, unknown>): { form: PostFormData; coverPath?: string } {
  const categories = (post.categories as { categoryId: string }[] | undefined) ?? [];
  const tags = (post.tags as { tagId: string }[] | undefined) ?? [];
  const coverMedia = post.coverMedia as { path?: string } | null | undefined;
  const publishedAt = post.publishedAt as string | undefined;

  return {
    form: {
      slug: (post.slug as string) ?? '',
      titleFa: (post.titleFa as string) ?? '',
      titleEn: (post.titleEn as string) ?? '',
      excerptFa: (post.excerptFa as string) ?? '',
      excerptEn: (post.excerptEn as string) ?? '',
      contentFa: (post.contentFa as string) ?? '',
      contentEn: (post.contentEn as string) ?? '',
      status: (post.status as PostFormData['status']) ?? 'DRAFT',
      publishedAt: publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : '',
      coverMediaId: (post.coverMediaId as string) ?? '',
      categoryIds: categories.map((c) => c.categoryId),
      tagIds: tags.map((t) => t.tagId),
      metaTitleFa: (post.metaTitleFa as string) ?? '',
      metaTitleEn: (post.metaTitleEn as string) ?? '',
      metaDescFa: (post.metaDescFa as string) ?? '',
      metaDescEn: (post.metaDescEn as string) ?? '',
    },
    coverPath: coverMedia?.path,
  };
}

export function formToPayload(form: PostFormData) {
  return {
    slug: form.slug,
    titleFa: form.titleFa || undefined,
    titleEn: form.titleEn || undefined,
    excerptFa: form.excerptFa || undefined,
    excerptEn: form.excerptEn || undefined,
    contentFa: form.contentFa || undefined,
    contentEn: form.contentEn || undefined,
    status: form.status,
    publishedAt:
      form.status === 'SCHEDULED' && form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : form.status === 'PUBLISHED'
          ? new Date().toISOString()
          : undefined,
    coverMediaId: form.coverMediaId || undefined,
    categoryIds: form.categoryIds,
    tagIds: form.tagIds,
    metaTitleFa: form.metaTitleFa || undefined,
    metaTitleEn: form.metaTitleEn || undefined,
    metaDescFa: form.metaDescFa || undefined,
    metaDescEn: form.metaDescEn || undefined,
  };
}
