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
  PageForm,
  emptyPageForm,
  formToPagePayload,
  pageToForm,
  type PageFormData,
} from '@/features/pages/components/page-form';

export default function EditPagePage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const id = params.id as string;
  const [form, setForm] = useState<PageFormData>(emptyPageForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>>(`/api/pages/${id}`).then((res) => {
      if (res.data) setForm(pageToForm(res.data));
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/pages/${id}`, formToPagePayload(form));
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
      description: t('confirm.deletePage'),
      onConfirm: async () => {
        await api.delete(`/api/pages/${id}`);
        toast({ title: tToast('deleted'), variant: 'success' });
        router.push(`/${locale}/dashboard/pages`);
      },
    });
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div>
      <PageHeader
        title={t('editPage')}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/pages`}>
              <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
            </Link>
            {user && isAdmin(user.role) ? (
              <Button variant="destructive" type="button" onClick={handleDelete}>{t('actions.delete')}</Button>
            ) : null}
            <Button type="submit" form="page-edit-form" disabled={saving}>{t('actions.save')}</Button>
          </div>
        }
      />
      <form id="page-edit-form" onSubmit={handleSave}>
        <PageForm form={form} onChange={setForm} />
      </form>
      <DeleteDialog />
    </div>
  );
}
