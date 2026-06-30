'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Skeleton,
  useToast,
} from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { SlugField } from '@/shared/components/slug-field';
import { PageHeader } from '@/features/layout/components/page-header';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';

export default function EditTagPage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const id = params.id as string;
  const [form, setForm] = useState({ slug: '', nameFa: '', nameEn: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ id: string; slug: string; nameFa: string; nameEn: string }[]>('/api/tags').then((res) => {
      const tag = res.data?.find((x) => x.id === id);
      if (tag) setForm({ slug: tag.slug, nameFa: tag.nameFa, nameEn: tag.nameEn });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/tags/${id}`, form);
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
      description: t('confirm.deleteTag'),
      onConfirm: async () => {
        await api.delete(`/api/tags/${id}`);
        toast({ title: tToast('deleted'), variant: 'success' });
        router.push(`/${locale}/dashboard/tags`);
      },
    });
  };

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div>
      <PageHeader
        title={t('editTag')}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/tags`}>
              <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
            </Link>
            <Button variant="destructive" type="button" onClick={handleDelete}>{t('actions.delete')}</Button>
            <Button type="submit" form="tag-edit-form" disabled={saving}>{t('actions.save')}</Button>
          </div>
        }
      />
      <form id="tag-edit-form" onSubmit={handleSave}>
        <Card variant="glass">
          <CardHeader><CardTitle>{tf('basicInfo')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField label={tf('nameFa')} required>
                <Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} required />
              </FormField>
              <FormField label={tf('nameEn')} required>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
              </FormField>
            </div>
            <SlugField
              slug={form.slug}
              titleEn={form.nameEn}
              onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
              autoSync={false}
              randomPrefix="tag"
              required
            />
          </CardContent>
        </Card>
      </form>
      <DeleteDialog />
    </div>
  );
}
