'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { Button, FormField, Input } from '@gh/ui';
import { randomSlug, slugifyFromEn } from '@/shared/lib/slug';

interface SlugFieldProps {
  slug: string;
  titleEn: string;
  titleFa?: string;
  onSlugChange: (slug: string) => void;
  autoSync?: boolean;
  randomPrefix?: string;
  required?: boolean;
  placeholder?: string;
}

export function SlugField({
  slug,
  titleEn,
  titleFa = '',
  onSlugChange,
  autoSync = true,
  randomPrefix = 'item',
  required,
  placeholder = 'my-item',
}: SlugFieldProps) {
  const tf = useTranslations('dashboard.form');
  const manualRef = useRef(false);
  const autoSlugRef = useRef(false);
  const onSlugChangeRef = useRef(onSlugChange);
  onSlugChangeRef.current = onSlugChange;

  useEffect(() => {
    if (!autoSync || manualRef.current) return;

    const fromEn = slugifyFromEn(titleEn);
    if (fromEn) {
      autoSlugRef.current = false;
      if (fromEn !== slug) onSlugChangeRef.current(fromEn);
      return;
    }

    const hasTitle = Boolean(titleEn.trim() || titleFa.trim());
    if (!slug && hasTitle && !autoSlugRef.current) {
      autoSlugRef.current = true;
      onSlugChangeRef.current(randomSlug(randomPrefix));
    }
  }, [titleEn, titleFa, autoSync, slug, randomPrefix]);

  return (
    <FormField label={tf('slug')} required={required}>
      <div className="flex gap-2">
        <Input
          value={slug}
          onChange={(e) => {
            manualRef.current = true;
            onSlugChange(e.target.value);
          }}
          placeholder={placeholder}
          required={required}
          className="flex-1 font-mono text-sm"
          dir="ltr"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          title={tf('generateSlug')}
          onClick={() => {
            manualRef.current = true;
            autoSlugRef.current = true;
            onSlugChange(randomSlug(randomPrefix));
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </FormField>
  );
}
