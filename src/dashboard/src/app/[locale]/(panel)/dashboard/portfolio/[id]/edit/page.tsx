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
  PortfolioForm,
  emptyPortfolioForm,
  formToPortfolioPayload,
  portfolioToForm,
  type PortfolioFormData,
} from '@/features/portfolio/components/portfolio-form';

export default function EditPortfolioPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const id = params.id as string;
  const [form, setForm] = useState<PortfolioFormData>(emptyPortfolioForm());
  const [coverPath, setCoverPath] = useState<string>();
  const [galleryPaths, setGalleryPaths] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>[]>('/api/portfolio').then(async (res) => {
      const item = res.data?.find((x) => x.id === id);
      if (item) {
        const { form: f, coverPath: cp, galleryPaths: gp } = portfolioToForm(item);
        setForm(f);
        setCoverPath(cp);

        const paths: Record<string, string> = { ...gp };
        for (const mediaId of f.galleryMediaIds) {
          if (!paths[mediaId]) {
            try {
              const mediaRes = await api.get<{ path: string }>(`/api/media/${mediaId}`);
              if (mediaRes.data?.path) paths[mediaId] = mediaRes.data.path;
            } catch { /* ignore */ }
          }
        }
        setGalleryPaths(paths);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/portfolio/${id}`, formToPortfolioPayload(form));
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
      description: t('confirm.deletePortfolio'),
      onConfirm: async () => {
        await api.delete(`/api/portfolio/${id}`);
        toast({ title: tToast('deleted'), variant: 'success' });
        router.push(`/${locale}/dashboard/portfolio`);
      },
    });
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div>
      <PageHeader
        title={t('editPortfolio')}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/portfolio`}>
              <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
            </Link>
            {user && isAdmin(user.role) ? (
              <Button variant="destructive" type="button" onClick={handleDelete}>{t('actions.delete')}</Button>
            ) : null}
            <Button type="submit" form="portfolio-edit-form" disabled={saving}>{t('actions.save')}</Button>
          </div>
        }
      />
      <form id="portfolio-edit-form" onSubmit={handleSave}>
        <PortfolioForm form={form} onChange={setForm} coverPath={coverPath} galleryPaths={galleryPaths} autoSlug={false} />
      </form>
      <DeleteDialog />
    </div>
  );
}
