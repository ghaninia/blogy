'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
} from '@gh/ui';
import { getLocalizedField } from '@/shared/lib/localized';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  children?: Category[];
}

interface CategoryComboboxProps {
  locale: string;
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function flattenCategories(
  cats: Category[],
  locale: string,
  depth = 0,
): { id: string; label: string }[] {
  return cats.flatMap((cat) => [
    {
      id: cat.id,
      label: `${depth > 0 ? '—'.repeat(depth) + ' ' : ''}${getLocalizedField(cat, 'name', locale) || cat.slug}`,
    },
    ...(cat.children ? flattenCategories(cat.children, locale, depth + 1) : []),
  ]);
}

export function CategoryCombobox({ locale, categories, selectedIds, onChange }: CategoryComboboxProps) {
  const t = useTranslations('dashboard.form');
  const [search, setSearch] = useState('');

  const flat = useMemo(() => flattenCategories(categories, locale), [categories, locale]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flat;
    return flat.filter((c) => c.label.toLowerCase().includes(q));
  }, [flat, search]);

  const selected = flat.filter((c) => selectedIds.includes(c.id));

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((cat) => (
            <Badge key={cat.id} variant="outline">
              {cat.label}
            </Badge>
          ))}
        </div>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            {t('categories')}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass w-[min(100vw-2rem,320px)] p-0" align="start">
          <div className="border-b border-border p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCategories')}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-sm hover:bg-accent',
                  selectedIds.includes(cat.id) && 'bg-accent',
                )}
              >
                <Check className={cn('h-4 w-4', selectedIds.includes(cat.id) ? 'opacity-100' : 'opacity-0')} />
                {cat.label}
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
