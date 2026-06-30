'use client';

import { useQuery } from '@tanstack/react-query';
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
} from '@gh/ui';
import { RichTextEditor } from '@/features/posts/components/rich-text-editor';
import { api } from '@/shared/api-client';
import { SlugField } from '@/shared/components/slug-field';

export interface CategoryFormData {
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  parentId: string;
}

export const emptyCategoryForm = (): CategoryFormData => ({
  slug: '',
  nameFa: '',
  nameEn: '',
  descriptionFa: '',
  descriptionEn: '',
  parentId: '',
});

interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  children?: Category[];
}

function flattenCategories(
  cats: Category[],
  excludeId?: string,
  depth = 0,
): { id: string; label: string }[] {
  return cats.flatMap((cat) => {
    if (cat.id === excludeId) return [];
    return [
      { id: cat.id, label: `${'—'.repeat(depth)} ${cat.nameEn || cat.slug}` },
      ...(cat.children ? flattenCategories(cat.children, excludeId, depth + 1) : []),
    ];
  });
}

interface CategoryFormProps {
  form: CategoryFormData;
  onChange: (form: CategoryFormData) => void;
  excludeId?: string;
  autoSlug?: boolean;
}

export function CategoryForm({ form, onChange, excludeId, autoSlug = true }: CategoryFormProps) {
  const tf = useTranslations('dashboard.form');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories', { all: 'true' });
      return res.data ?? [];
    },
  });

  const set = (patch: Partial<CategoryFormData>) => onChange({ ...form, ...patch });
  const options = flattenCategories(categories, excludeId);

  return (
    <Card variant="glass">
      <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label={tf('nameFa')} required>
            <Input value={form.nameFa} onChange={(e) => set({ nameFa: e.target.value })} required />
          </FormField>
          <FormField label={tf('nameEn')} required>
            <Input value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} required />
          </FormField>
        </div>
        <SlugField
          slug={form.slug}
          titleEn={form.nameEn}
          onSlugChange={(slug) => set({ slug })}
          autoSync={autoSlug}
          randomPrefix="category"
          required
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label={tf('descriptionFa')}>
            <RichTextEditor variant="compact" content={form.descriptionFa} onChange={(html) => set({ descriptionFa: html })} />
          </FormField>
          <FormField label={tf('descriptionEn')}>
            <RichTextEditor variant="compact" content={form.descriptionEn} onChange={(html) => set({ descriptionEn: html })} />
          </FormField>
        </div>
        <FormField label={tf('parentCategory')}>
          <Select
            value={form.parentId || 'none'}
            onValueChange={(v) => set({ parentId: v === 'none' ? '' : v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{tf('noParent')}</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </CardContent>
    </Card>
  );
}

export function categoryToForm(cat: Record<string, unknown>): CategoryFormData {
  return {
    slug: (cat.slug as string) ?? '',
    nameFa: (cat.nameFa as string) ?? '',
    nameEn: (cat.nameEn as string) ?? '',
    descriptionFa: (cat.descriptionFa as string) ?? '',
    descriptionEn: (cat.descriptionEn as string) ?? '',
    parentId: (cat.parentId as string) ?? '',
  };
}

export function formToCategoryPayload(form: CategoryFormData) {
  return {
    slug: form.slug,
    nameFa: form.nameFa,
    nameEn: form.nameEn,
    descriptionFa: form.descriptionFa || undefined,
    descriptionEn: form.descriptionEn || undefined,
    parentId: form.parentId || undefined,
  };
}
