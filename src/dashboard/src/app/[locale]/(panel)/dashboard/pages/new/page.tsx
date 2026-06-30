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
  PageForm,
  emptyPageForm,
  formToPagePayload,
  type PageFormData,
} from '@/features/pages/components/page-form';

export default function NewPagePage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const [form, setForm] = useState<PageFormData>(emptyPageForm());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ id: string }>('/api/pages', formToPagePayload(form));
      toast({ title: tToast('saved'), variant: 'success' });
      router.push(`/${locale}/dashboard/pages/${res.data?.id}/edit`);
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
        title={t('newPage')}
        action={
          <Link href={`/${locale}/dashboard/pages`}>
            <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit}>
        <PageForm form={form} onChange={setForm} />
        <Button type="submit" disabled={loading} className="mt-2">{t('actions.save')}</Button>
      </form>
    </div>
  );
}
