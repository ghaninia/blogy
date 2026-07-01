'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button, useToast } from '@gh/ui';
import { api } from '@/shared/api-client';
import { formatApiError } from '@/shared/lib/format-api-error';
import { PageHeader } from '@/features/layout/components/page-header';
import {
  PostForm,
  emptyPostForm,
  formToPayload,
  type PostFormData,
} from '@/features/posts/components/post-form';

export default function NewPostPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();

  const [form, setForm] = useState<PostFormData>(emptyPostForm());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ id: string }>('/api/posts', formToPayload(form));
      toast({ title: tToast('saved'), variant: 'success' });
      router.push(`/${locale}/dashboard/posts/${res.data?.id}/edit`);
    } catch (err) {
      toast({
        title: tToast('error'),
        description: formatApiError(err),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-0">
      <PageHeader
        title={t('newPost')}
        action={
          <Link href={`/${locale}/dashboard/posts`}>
            <Button variant="outline">
              <ArrowLeft className="me-2 h-4 w-4" />
              {t('actions.back')}
            </Button>
          </Link>
        }
      />

      <form id="post-new-form" onSubmit={handleSubmit}>
        <PostForm locale={locale} form={form} onChange={setForm} />
        <Button type="submit" disabled={loading} className="mt-2 hidden md:inline-flex">
          {t('actions.save')}
        </Button>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur md:hidden">
        <Button type="submit" form="post-new-form" disabled={loading} className="w-full">
          {t('actions.save')}
        </Button>
      </div>
    </div>
  );
}
