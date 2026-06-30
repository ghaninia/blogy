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
  Textarea,
} from '@gh/ui';
import { api } from '@/shared/api-client';

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
}

export function CategoryForm({ form, onChange, excludeId }: CategoryFormProps) {
  const tf = useTranslations('dashboard.form');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories');
      return res.data ?? [];
    },
  });

  const set = (patch: Partial<CategoryFormData>) => onChange({ ...form, ...patch });
  const options = flattenCategories(categories, excludeId);

  return (
    <Card variant="glass">
      <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <FormField label={tf('slug')} required>
          <Input value={form.slug} onChange={(e) => set({ slug: e.target.value })} required />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={tf('nameFa')} required>
            <Input value={form.nameFa} onChange={(e) => set({ nameFa: e.target.value })} required />
          </FormField>
          <FormField label={tf('nameEn')} required>
            <Input value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} required />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={tf('descriptionFa')}>
            <Textarea value={form.descriptionFa} onChange={(e) => set({ descriptionFa: e.target.value })} rows={3} />
          </FormField>
          <FormField label={tf('descriptionEn')}>
            <Textarea value={form.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} rows={3} />
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
