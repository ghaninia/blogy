'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button, Skeleton, useToast } from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { isAdmin } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';
import {
  CategoryForm,
  emptyCategoryForm,
  formToCategoryPayload,
  categoryToForm,
  type CategoryFormData,
} from '@/features/categories/components/category-form';

export default function EditCategoryPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const id = params.id as string;
  const [form, setForm] = useState<CategoryFormData>(emptyCategoryForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>>(`/api/categories/${id}`).then((res) => {
      if (res.data) setForm(categoryToForm(res.data));
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/categories/${id}`, formToCategoryPayload(form));
      toast({ title: tToast('saved'), variant: 'success' });
    } catch (err) {
      toast({
        title: tToast('error'),
        description: err instanceof ApiError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirmDelete({
      description: t('confirm.deleteCategory'),
      onConfirm: async () => {
        await api.delete(`/api/categories/${id}`);
        toast({ title: tToast('deleted'), variant: 'success' });
        router.push(`/${locale}/dashboard/categories`);
      },
    });
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div>
      <PageHeader
        title={t('editCategory')}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/categories`}>
              <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
            </Link>
            {user && isAdmin(user.role) ? (
              <Button variant="destructive" type="button" onClick={handleDelete}>{t('actions.delete')}</Button>
            ) : null}
            <Button type="submit" form="category-edit-form" disabled={saving}>{t('actions.save')}</Button>
          </div>
        }
      />
      <form id="category-edit-form" onSubmit={handleSave}>
        <CategoryForm form={form} onChange={setForm} excludeId={id} />
      </form>
      <DeleteDialog />
    </div>
  );
}
