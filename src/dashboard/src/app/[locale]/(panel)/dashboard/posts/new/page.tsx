'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, ArrowLeft, Check, CloudUpload, Eye } from 'lucide-react';
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
import { PostPreviewDialog } from '@/features/posts/components/post-preview-dialog';
import { PublishConfirmationDialog } from '@/features/posts/components/publish-confirmation-dialog';

export default function NewPostPage() {
  const t = useTranslations('dashboard');
  const tToast = useTranslations('dashboard.toast');
  const tEditor = useTranslations('dashboard.editor');
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();

  const [form, setForm] = useState<PostFormData>(emptyPostForm());
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const [draftId, setDraftId] = useState<string | null>(null);
  const latestForm = useRef(form);
  latestForm.current = form;
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingDraft = useRef(false);

  useEffect(() => {
    const hasWriting = Boolean(
      form.titleFa.trim() || form.titleEn.trim() || form.excerptFa.trim() || form.excerptEn.trim() ||
      form.contentFa.trim() || form.contentEn.trim(),
    );
    if (!hasWriting || draftId || creatingDraft.current) return;
    setAutoSaveState('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const snapshot = JSON.stringify(form);
    autoSaveTimer.current = setTimeout(async () => {
      if (creatingDraft.current || draftId) return;
      creatingDraft.current = true;
      setAutoSaveState('saving');
      try {
        const current = JSON.parse(snapshot) as PostFormData;
        const response = await api.post<{ id: string }>('/api/posts', {
          ...formToPayload(current), status: 'DRAFT', publishedAt: undefined,
        });
        const id = response.data?.id;
        if (!id) throw new Error('Draft was not created');
        setDraftId(id);
        const latest = latestForm.current;
        if (JSON.stringify(latest) !== snapshot) {
          await api.patch(`/api/posts/${id}`, {
            ...formToPayload(latest), status: 'DRAFT', publishedAt: undefined,
          });
        }
        setAutoSaveState('saved');
        router.replace(`/${locale}/dashboard/posts/${id}/edit`);
      } catch {
        setAutoSaveState('error');
      } finally {
        creatingDraft.current = false;
      }
    }, 1200);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, draftId, locale, router]);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (autoSaveState === 'unsaved' || autoSaveState === 'saving' || autoSaveState === 'error') {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [autoSaveState]);

  const savePost = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setLoading(true);
    try {
      const payload = formToPayload(form);
      const res = draftId
        ? await api.patch<{ id: string }>(`/api/posts/${draftId}`, payload)
        : await api.post<{ id: string }>('/api/posts', payload);
      toast({ title: tToast('saved'), variant: 'success' });
      router.push(`/${locale}/dashboard/posts/${res.data?.id ?? draftId}/edit`);
    } catch (err) {
      toast({ title: tToast('error'), description: formatApiError(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.status === 'PUBLISHED') {
      setPublishConfirmOpen(true);
      return;
    }
    void savePost();
  };

  return (
    <div className="pb-20 md:pb-0">
      <PageHeader
        title={t('newPost')}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${locale}/dashboard/posts`}>
              <Button variant="outline"><ArrowLeft className="me-2 h-4 w-4" />{t('actions.back')}</Button>
            </Link>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="me-2 h-4 w-4" />{tEditor('preview')}
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
              {autoSaveState === 'saving' ? <CloudUpload className="h-3.5 w-3.5" /> : null}
              {autoSaveState === 'saved' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
              {autoSaveState === 'error' ? <AlertCircle className="h-3.5 w-3.5 text-destructive" /> : null}
              {autoSaveState === 'saving' ? tEditor('saving') : null}
              {autoSaveState === 'saved' ? tEditor('saved') : null}
              {autoSaveState === 'unsaved' ? tEditor('unsaved') : null}
              {autoSaveState === 'error' ? tEditor('saveError') : null}
            </span>
            <Button type="submit" form="post-new-form" disabled={loading || autoSaveState === 'saving'} className="hidden md:inline-flex">
              {t('actions.save')}
            </Button>
          </div>
        }
      />

      <form id="post-new-form" onSubmit={handleSubmit}>
        <PostForm locale={locale} form={form} onChange={setForm} />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur md:hidden">
        <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)} aria-label={tEditor('preview')}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button type="submit" form="post-new-form" disabled={loading || autoSaveState === 'saving'} className="flex-1">{t('actions.save')}</Button>
      </div>
      <PostPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        locale={locale}
        title={locale === 'fa' ? form.titleFa : form.titleEn}
        excerpt={locale === 'fa' ? form.excerptFa : form.excerptEn}
        content={locale === 'fa' ? form.contentFa : form.contentEn}
      />
      <PublishConfirmationDialog
        open={publishConfirmOpen}
        onOpenChange={setPublishConfirmOpen}
        onConfirm={() => { setPublishConfirmOpen(false); void savePost(); }}
      />
    </div>
  );
}
