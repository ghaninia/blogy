'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button, useToast } from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import {
  CategoryForm,
  emptyCategoryForm,
  formToCategoryPayload,
  type CategoryFormData,
} from '@/features/categories/components/category-form';

export default function NewCategoryPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const [form, setForm] = useState<CategoryFormData>(emptyCategoryForm());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ id: string }>('/api/categories', formToCategoryPayload(form));
      toast({ title: tToast('saved'), variant: 'success' });
      router.push(`/${locale}/dashboard/categories/${res.data?.id}/edit`);
    } catch (err) {
      toast({
        title: tToast('error'),
        description: err instanceof ApiError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('newCategory')}
        action={
          <Link href={`/${locale}/dashboard/categories`}>
            <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit}>
        <CategoryForm form={form} onChange={setForm} />
        <Button type="submit" disabled={loading} className="mt-4">{t('actions.save')}</Button>
      </form>
    </div>
  );
}
