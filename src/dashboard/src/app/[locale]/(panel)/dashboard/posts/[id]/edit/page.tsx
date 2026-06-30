'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button, Skeleton, useToast } from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { canDeletePost } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';
import {
  PostForm,
  emptyPostForm,
  formToPayload,
  postToForm,
  type PostFormData,
} from '@/features/posts/components/post-form';

export default function EditPostPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const id = params.id as string;
  const [form, setForm] = useState<PostFormData>(emptyPostForm());
  const [coverPath, setCoverPath] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/posts/${id}`)
      .then((res) => {
        if (res.data) {
          const { form: f, coverPath: cp } = postToForm(res.data);
          setForm(f);
          setCoverPath(cp);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/posts/${id}`, formToPayload(form));
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
      description: t('confirm.deletePost'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/posts/${id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          router.push(`/${locale}/dashboard/posts`);
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const showDelete = user ? canDeletePost(user.role) : false;

  return (
    <div>
      <PageHeader
        title={t('editPost')}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/dashboard/posts`}>
              <Button variant="outline">
                <ArrowLeft className="me-2 h-4 w-4" />
                {t('actions.back')}
              </Button>
            </Link>
            {showDelete ? (
              <Button variant="destructive" type="button" onClick={handleDelete}>
                {t('actions.delete')}
              </Button>
            ) : null}
            <Button type="submit" form="post-edit-form" disabled={saving}>
              {t('actions.save')}
            </Button>
          </div>
        }
      />

      <form id="post-edit-form" onSubmit={handleSave}>
        <PostForm locale={locale} form={form} onChange={setForm} coverPath={coverPath} />
      </form>

      <DeleteDialog />
    </div>
  );
}
