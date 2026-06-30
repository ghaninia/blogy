'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  useToast,
} from '@gh/ui';
import { api, ApiError } from '@/shared/api-client';
import { SlugField } from '@/shared/components/slug-field';
import { PageHeader } from '@/features/layout/components/page-header';

export default function NewTagPage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const [form, setForm] = useState({ slug: '', nameFa: '', nameEn: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ id: string }>('/api/tags', form);
      toast({ title: tToast('saved'), variant: 'success' });
      router.push(`/${locale}/dashboard/tags/${res.data?.id}/edit`);
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
        title={t('newTag')}
        action={
          <Link href={`/${locale}/dashboard/tags`}>
            <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit}>
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
              randomPrefix="tag"
              required
            />
          </CardContent>
        </Card>
        <Button type="submit" disabled={loading} className="mt-4">{t('actions.save')}</Button>
      </form>
    </div>
  );
}
