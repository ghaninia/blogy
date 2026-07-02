'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FileText, FolderTree, PenLine, Search } from 'lucide-react';
import {
  Button,
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
import { api, getMediaUrl } from '@/shared/api-client';
import { SlugField } from '@/shared/components/slug-field';
import { optionalRichText, optionalString } from '@/shared/lib/rich-text';
import { randomSlug, slugifyFromEn } from '@/shared/lib/slug';
import { FormTabPanel, FormTabs, type FormTabItem } from '@/features/layout/components/form-tabs';
import { RichTextEditor, type RichTextEditorHandle } from '@/features/posts/components/rich-text-editor';
import { CreatableTagPicker } from '@/features/posts/components/creatable-tag-picker';
import { CategoryCombobox } from '@/features/posts/components/category-combobox';
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
  commentsEnabled: boolean;
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
  onChange: Dispatch<SetStateAction<PostFormData>>;
  coverPath?: string;
  formId?: string;
  autoSlug?: boolean;
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
  commentsEnabled: true,
});

export function PostForm({ locale, form, onChange, coverPath, formId = 'post-form', autoSlug = true }: PostFormProps) {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const ts = useTranslations('status');
  const [activeTab, setActiveTab] = useState('basic');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'fa' | 'en'>('cover');
  const [coverPreview, setCoverPreview] = useState(coverPath ?? '');
  const editorFaRef = useRef<RichTextEditorHandle>(null);
  const editorEnRef = useRef<RichTextEditorHandle>(null);

  useEffect(() => {
    if (coverPath) setCoverPreview(coverPath);
  }, [coverPath]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories', { all: 'true' });
      return res.data ?? [];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags', 'all'],
    queryFn: async () => {
      const res = await api.get<Tag[]>('/api/tags', { all: 'true' });
      return res.data ?? [];
    },
  });

  const set = useCallback(
    (patch: Partial<PostFormData>) => onChange((prev) => ({ ...prev, ...patch })),
    [onChange],
  );

  const formTabs: FormTabItem[] = [
    { value: 'basic', label: tf('tabs.basic'), icon: FileText },
    { value: 'content', label: tf('tabs.content'), icon: PenLine },
    { value: 'taxonomy', label: tf('tabs.taxonomy'), icon: FolderTree },
    { value: 'seo', label: tf('tabs.seo'), icon: Search },
  ];

  return (
    <>
      <FormTabs value={activeTab} onValueChange={setActiveTab} items={formTabs}>
        <FormTabPanel value="basic">
          <Card variant="glass">
            <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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
                titleFa={form.titleFa}
                onSlugChange={(slug) => set({ slug })}
                autoSync={autoSlug}
                randomPrefix="post"
                required
                placeholder="my-post"
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <FormField label={tf('excerptFa')}>
                  {activeTab === 'basic' ? (
                    <RichTextEditor variant="compact" content={form.excerptFa} onChange={(html) => set({ excerptFa: html })} />
                  ) : null}
                </FormField>
                <FormField label={tf('excerptEn')}>
                  {activeTab === 'basic' ? (
                    <RichTextEditor variant="compact" content={form.excerptEn} onChange={(html) => set({ excerptEn: html })} />
                  ) : null}
                </FormField>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <FormField label={tf('status')}>
                  <Select value={form.status} onValueChange={(v) => set({ status: v as PostFormData['status'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{ts('DRAFT')}</SelectItem>
                      <SelectItem value="PUBLISHED">{ts('PUBLISHED')}</SelectItem>
                      <SelectItem value="SCHEDULED">{ts('SCHEDULED')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                {form.status === 'SCHEDULED' ? (
                  <FormField label={tf('publishedAt')}>
                    <Input type="datetime-local" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} />
                  </FormField>
                ) : null}
              </div>
              <FormField label={tf('commentsEnabled')}>
                <div className="space-y-2">
                  <Switch
                    checked={form.commentsEnabled}
                    onCheckedChange={(value) => set({ commentsEnabled: value })}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">{tf('commentsEnabledHint')}</p>
                </div>
              </FormField>
              <FormField label={tf('cover')}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {coverPreview ? (
                    <div className="relative h-20 w-full max-w-[8rem] overflow-hidden rounded-lg border">
                      <Image src={getMediaUrl(coverPreview)} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => { setMediaTarget('cover'); setMediaOpen(true); }}>
                      {t('actions.selectCover')}
                    </Button>
                    {form.coverMediaId ? (
                      <Button type="button" variant="ghost" onClick={() => { set({ coverMediaId: '' }); setCoverPreview(''); }}>
                        {t('actions.removeCover')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </FormField>
            </CardContent>
          </Card>
        </FormTabPanel>

        <FormTabPanel value="content" className="space-y-4">
          {activeTab === 'content' ? (
            <>
              <Card variant="glass">
                <CardHeader><CardTitle>{tf('contentFa')}</CardTitle></CardHeader>
                <CardContent>
                  <RichTextEditor
                    ref={editorFaRef}
                    content={form.contentFa}
                    onChange={(html) => set({ contentFa: html })}
                    onImageRequest={() => { setMediaTarget('fa'); setMediaOpen(true); }}
                  />
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader><CardTitle>{tf('contentEn')}</CardTitle></CardHeader>
                <CardContent>
                  <RichTextEditor
                    ref={editorEnRef}
                    content={form.contentEn}
                    onChange={(html) => set({ contentEn: html })}
                    onImageRequest={() => { setMediaTarget('en'); setMediaOpen(true); }}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}
        </FormTabPanel>

        <FormTabPanel value="taxonomy">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card variant="glass">
              <CardHeader><CardTitle>{tf('categories')}</CardTitle></CardHeader>
              <CardContent>
                <CategoryCombobox
                  locale={locale}
                  categories={categories}
                  selectedIds={form.categoryIds}
                  onChange={(categoryIds) => set({ categoryIds })}
                />
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardHeader><CardTitle>{tf('tags')}</CardTitle></CardHeader>
              <CardContent>
                <CreatableTagPicker
                  locale={locale}
                  tags={tags}
                  selectedIds={form.tagIds}
                  onChange={(tagIds) => set({ tagIds })}
                />
              </CardContent>
            </Card>
          </div>
        </FormTabPanel>

        <FormTabPanel value="seo">
          <Card variant="glass">
            <CardHeader><CardTitle>{tf('seo')}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
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
        </FormTabPanel>
      </FormTabs>

      <div id={formId} aria-hidden className="hidden" />

      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          if (mediaTarget === 'cover') {
            set({ coverMediaId: media.id });
            setCoverPreview(media.path);
          } else if (mediaTarget === 'fa') {
            editorFaRef.current?.insertImage(getMediaUrl(media.path), media.originalName);
          } else {
            editorEnRef.current?.insertImage(getMediaUrl(media.path), media.originalName);
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
      commentsEnabled: (post.commentsEnabled as boolean | undefined) ?? true,
    },
    coverPath: coverMedia?.path,
  };
}

export function formToPayload(form: PostFormData) {
  const slug =
    optionalString(form.slug) ??
    (slugifyFromEn(form.titleEn) || randomSlug('post'));

  return {
    slug,
    titleFa: optionalString(form.titleFa),
    titleEn: optionalString(form.titleEn),
    excerptFa: optionalRichText(form.excerptFa),
    excerptEn: optionalRichText(form.excerptEn),
    contentFa: optionalRichText(form.contentFa),
    contentEn: optionalRichText(form.contentEn),
    status: form.status,
    publishedAt:
      form.status === 'SCHEDULED' && form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : form.status === 'PUBLISHED'
          ? new Date().toISOString()
          : undefined,
    coverMediaId: optionalString(form.coverMediaId),
    categoryIds: form.categoryIds.length ? form.categoryIds : undefined,
    tagIds: form.tagIds.length ? form.tagIds : undefined,
    metaTitleFa: optionalString(form.metaTitleFa),
    metaTitleEn: optionalString(form.metaTitleEn),
    metaDescFa: optionalString(form.metaDescFa),
    metaDescEn: optionalString(form.metaDescEn),
    commentsEnabled: form.commentsEnabled,
  };
}
