'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Switch,
  Textarea,
} from '@gh/ui';
import { getMediaUrl } from '@/shared/api-client';
import { MediaManager } from '@/features/media/components/media-manager';

export interface PortfolioFormData {
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  projectUrl: string;
  githubUrl: string;
  technologies: string[];
  coverMediaId: string;
  galleryMediaIds: string[];
  isPublished: boolean;
  sortOrder: number;
}

export const emptyPortfolioForm = (): PortfolioFormData => ({
  slug: '',
  titleFa: '',
  titleEn: '',
  descriptionFa: '',
  descriptionEn: '',
  projectUrl: '',
  githubUrl: '',
  technologies: [],
  coverMediaId: '',
  galleryMediaIds: [],
  isPublished: false,
  sortOrder: 0,
});

interface PortfolioFormProps {
  form: PortfolioFormData;
  onChange: (form: PortfolioFormData) => void;
  coverPath?: string;
  galleryPaths?: Record<string, string>;
}

export function PortfolioForm({ form, onChange, coverPath, galleryPaths }: PortfolioFormProps) {
  const tf = useTranslations('dashboard.form');
  const t = useTranslations('dashboard.actions');
  const [techInput, setTechInput] = useState('');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'cover' | 'gallery'>('cover');

  const set = (patch: Partial<PortfolioFormData>) => onChange({ ...form, ...patch });

  const addTech = () => {
    const val = techInput.trim();
    if (val && !form.technologies.includes(val)) {
      set({ technologies: [...form.technologies, val] });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    set({ technologies: form.technologies.filter((x) => x !== tech) });
  };

  return (
    <>
      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label={tf('slug')} required>
            <Input value={form.slug} onChange={(e) => set({ slug: e.target.value })} required />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('titleFa')} required>
              <Input value={form.titleFa} onChange={(e) => set({ titleFa: e.target.value })} required />
            </FormField>
            <FormField label={tf('titleEn')} required>
              <Input value={form.titleEn} onChange={(e) => set({ titleEn: e.target.value })} required />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('descriptionFa')}>
              <Textarea value={form.descriptionFa} onChange={(e) => set({ descriptionFa: e.target.value })} rows={4} />
            </FormField>
            <FormField label={tf('descriptionEn')}>
              <Textarea value={form.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} rows={4} />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('projectUrl')}>
              <Input value={form.projectUrl} onChange={(e) => set({ projectUrl: e.target.value })} type="url" />
            </FormField>
            <FormField label={tf('githubUrl')}>
              <Input value={form.githubUrl} onChange={(e) => set({ githubUrl: e.target.value })} type="url" />
            </FormField>
          </div>
          <FormField label={tf('technologies')}>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder={tf('technologyPlaceholder')}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
              />
              <Button type="button" variant="outline" onClick={addTech}>+</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.technologies.map((tech) => (
                <Badge key={tech} variant="glass" className="gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={tf('sortOrder')}>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set({ sortOrder: parseInt(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label={tf('isPublished')}>
              <Switch checked={form.isPublished} onCheckedChange={(v) => set({ isPublished: v })} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('cover')}</CardTitle></CardHeader>
        <CardContent>
          {coverPath ? (
            <div className="relative mb-4 h-32 w-48 overflow-hidden rounded-lg">
              <Image src={getMediaUrl(coverPath)} alt="" fill className="object-cover" unoptimized />
            </div>
          ) : null}
          <Button type="button" variant="outline" onClick={() => { setMediaMode('cover'); setMediaOpen(true); }}>
            {t('selectCover')}
          </Button>
        </CardContent>
      </Card>

      <Card variant="glass" className="mb-6">
        <CardHeader><CardTitle>{tf('gallery')}</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {form.galleryMediaIds.map((id) => (
              <div key={id} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                {galleryPaths?.[id] ? (
                  <Image src={getMediaUrl(galleryPaths[id])} alt="" fill className="object-cover" unoptimized />
                ) : null}
                <button
                  type="button"
                  className="absolute end-1 top-1 rounded bg-destructive p-0.5 text-white"
                  onClick={() => set({ galleryMediaIds: form.galleryMediaIds.filter((x) => x !== id) })}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={() => { setMediaMode('gallery'); setMediaOpen(true); }}>
            {t('selectGallery')}
          </Button>
        </CardContent>
      </Card>

      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(media) => {
          if (mediaMode === 'cover') {
            set({ coverMediaId: media.id });
          } else if (!form.galleryMediaIds.includes(media.id)) {
            set({ galleryMediaIds: [...form.galleryMediaIds, media.id] });
          }
        }}
      />
    </>
  );
}

export function portfolioToForm(item: Record<string, unknown>): {
  form: PortfolioFormData;
  coverPath?: string;
  galleryPaths: Record<string, string>;
} {
  const coverMedia = item.coverMedia as { id?: string; path?: string } | null;
  const galleryIds = (item.galleryMediaIds as string[]) ?? [];

  return {
    form: {
      slug: (item.slug as string) ?? '',
      titleFa: (item.titleFa as string) ?? '',
      titleEn: (item.titleEn as string) ?? '',
      descriptionFa: (item.descriptionFa as string) ?? '',
      descriptionEn: (item.descriptionEn as string) ?? '',
      projectUrl: (item.projectUrl as string) ?? '',
      githubUrl: (item.githubUrl as string) ?? '',
      technologies: (item.technologies as string[]) ?? [],
      coverMediaId: (item.coverMediaId as string) ?? '',
      galleryMediaIds: galleryIds,
      isPublished: (item.isPublished as boolean) ?? false,
      sortOrder: (item.sortOrder as number) ?? 0,
    },
    coverPath: coverMedia?.path,
    galleryPaths: {},
  };
}

export function formToPortfolioPayload(form: PortfolioFormData) {
  return {
    slug: form.slug,
    titleFa: form.titleFa,
    titleEn: form.titleEn,
    descriptionFa: form.descriptionFa || undefined,
    descriptionEn: form.descriptionEn || undefined,
    projectUrl: form.projectUrl || undefined,
    githubUrl: form.githubUrl || undefined,
    technologies: form.technologies,
    coverMediaId: form.coverMediaId || undefined,
    galleryMediaIds: form.galleryMediaIds,
    isPublished: form.isPublished,
    sortOrder: form.sortOrder,
  };
}
