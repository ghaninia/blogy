'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { Badge, Button, Input, useToast } from '@gh/ui';
import { api } from '@/shared/api-client';
import { slugifyFromEn, randomSlug } from '@/shared/lib/slug';
import { getLocalizedField } from '@/shared/lib/localized';

interface Tag {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
}

interface CreatableTagPickerProps {
  locale: string;
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function slugify(text: string): string {
  return slugifyFromEn(text) || randomSlug('tag');
}

export function CreatableTagPicker({ locale, tags, selectedIds, onChange }: CreatableTagPickerProps) {
  const t = useTranslations('dashboard.tagPicker');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedIds.includes(tag.id)),
    [tags, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags.filter((tag) => !selectedIds.includes(tag.id)).slice(0, 12);
    return tags.filter(
      (tag) =>
        !selectedIds.includes(tag.id) &&
        (tag.slug.includes(q) ||
          tag.nameFa.toLowerCase().includes(q) ||
          tag.nameEn.toLowerCase().includes(q)),
    );
  }, [tags, query, selectedIds]);

  const canCreate =
    query.trim().length > 0 &&
    !tags.some(
      (tag) =>
        tag.slug === slugify(query) ||
        tag.nameFa === query.trim() ||
        tag.nameEn === query.trim(),
    );

  const addTag = (id: string) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setQuery('');
  };

  const removeTag = (id: string) => onChange(selectedIds.filter((x) => x !== id));

  const createTag = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await api.post<Tag>('/api/tags', {
        slug: slugify(name) || `tag-${Date.now()}`,
        nameFa: locale === 'fa' ? name : name,
        nameEn: locale === 'en' ? name : name,
      });
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      if (res.data?.id) addTag(res.data.id);
      toast({ title: t('created'), variant: 'success' });
    } catch (err) {
      toast({
        title: t('createError'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pe-1">
              {getLocalizedField(tag, 'name', locale)}
              <button type="button" onClick={() => removeTag(tag.id)} className="rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchOrCreate')}
      />

      <div className="flex flex-wrap gap-2">
        {filtered.map((tag) => (
          <Button key={tag.id} type="button" size="sm" variant="outline" onClick={() => addTag(tag.id)}>
            {getLocalizedField(tag, 'name', locale)}
          </Button>
        ))}
        {canCreate ? (
          <Button type="button" size="sm" variant="soft" disabled={creating} onClick={createTag}>
            <Plus className="me-1 h-3 w-3" />
            {t('create', { name: query.trim() })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
