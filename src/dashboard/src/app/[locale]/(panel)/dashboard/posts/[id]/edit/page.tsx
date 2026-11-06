'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, ArrowLeft, Check, CloudUpload, Eye } from 'lucide-react';
import { Button, Skeleton, useToast } from '@gh/ui';
import { api } from '@/shared/api-client';
import { formatApiError } from '@/shared/lib/format-api-error';
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
import { PostPreviewDialog } from '@/features/posts/components/post-preview-dialog';
import { PublishConfirmationDialog } from '@/features/posts/components/publish-confirmation-dialog';

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
  const tEditor = useTranslations('dashboard.editor');
  const [form, setForm] = useState<PostFormData>(emptyPostForm());
  const [coverPath, setCoverPath] = useState<string>();
  const [socialImagePath, setSocialImagePath] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'saved' | 'unsaved' | 'saving' | 'error'>(
    'saved',
  );
  const [loaded, setLoaded] = useState(false);
  const lastSavedForm = useRef<string | null>(null);
  const latestForm = useRef(form);
  latestForm.current = form;
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveInFlight = useRef(false);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/posts/${id}`)
      .then((res) => {
        if (res.data) {
          const { form: f, coverPath: cp, socialImagePath: sp } = postToForm(res.data);
          setForm(f);
          setCoverPath(cp);
          setSocialImagePath(sp);
          lastSavedForm.current = JSON.stringify(f);
          latestForm.current = f;
          setLoaded(true);
        }
      })
      .catch((err) => {
        toast({ title: tToast('error'), description: formatApiError(err), variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loaded || !lastSavedForm.current) return;
    const snapshot = JSON.stringify(form);
    if (snapshot === lastSavedForm.current) {
      setAutoSaveState('saved');
      return;
    }

    const currentSnapshot = JSON.parse(snapshot) as PostFormData;
    const persistedSnapshot = JSON.parse(lastSavedForm.current) as PostFormData;
    const statusChanged = currentSnapshot.status !== persistedSnapshot.status;
    const comparable = (value: PostFormData) =>
      JSON.stringify({ ...value, status: undefined, publishedAt: undefined });
    if (statusChanged && comparable(currentSnapshot) === comparable(persistedSnapshot)) {
      setAutoSaveState('unsaved');
      return;
    }

    setAutoSaveState('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (autoSaveInFlight.current) {
        setAutoSaveState('unsaved');
        return;
      }
      autoSaveInFlight.current = true;
      setAutoSaveState('saving');
      try {
        const nextForm = JSON.parse(snapshot) as PostFormData;
        const baseline = JSON.parse(lastSavedForm.current as string) as PostFormData;
        const nextStatusChanged = nextForm.status !== baseline.status;
        const autosaveForm = nextStatusChanged
          ? { ...nextForm, status: baseline.status, publishedAt: baseline.publishedAt }
          : nextForm;
        await api.patch(`/api/posts/${id}`, formToPayload(autosaveForm));
        lastSavedForm.current = JSON.stringify(autosaveForm);
        if (JSON.stringify(latestForm.current) === snapshot) {
          setAutoSaveState(nextStatusChanged ? 'unsaved' : 'saved');
        } else {
          setAutoSaveState('unsaved');
          setForm((current) => ({ ...current }));
        }
      } catch {
        setAutoSaveState('error');
      } finally {
        autoSaveInFlight.current = false;
      }
    }, 1000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, id, loaded]);

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
    setSaving(true);
    try {
      await api.patch(`/api/posts/${id}`, formToPayload(form));
      lastSavedForm.current = JSON.stringify(form);
      setAutoSaveState('saved');
      toast({ title: tToast('saved'), variant: 'success' });
    } catch (err) {
      toast({
        title: tToast('error'),
        description: formatApiError(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.status === 'PUBLISHED') {
      setPublishConfirmOpen(true);
      return;
    }
    void savePost();
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
    <div className="pb-20 md:pb-0">
      <PageHeader
        title={t('editPost')}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
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
            <Button variant="outline" type="button" onClick={() => setPreviewOpen(true)}>
              <Eye className="me-2 h-4 w-4" />
              {tEditor('preview')}
            </Button>
            <span
              className="inline-flex items-center gap-1.5 self-center text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {autoSaveState === 'saving' ? <CloudUpload className="h-3.5 w-3.5" /> : null}
              {autoSaveState === 'saved' ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : null}
              {autoSaveState === 'error' ? (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              ) : null}
              {autoSaveState === 'saving' ? tEditor('saving') : null}
              {autoSaveState === 'saved' ? tEditor('saved') : null}
              {autoSaveState === 'unsaved' ? tEditor('unsaved') : null}
              {autoSaveState === 'error' ? tEditor('saveError') : null}
            </span>
            <Button
              type="submit"
              form="post-edit-form"
              disabled={saving || autoSaveState === 'saving'}
              className="hidden md:inline-flex"
            >
              {t('actions.save')}
            </Button>
          </div>
        }
      />

      <form id="post-edit-form" onSubmit={handleSave}>
        <PostForm
          locale={locale}
          form={form}
          onChange={setForm}
          autoSlug={false}
          coverPath={coverPath}
          socialImagePath={socialImagePath}
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            aria-label={tEditor('preview')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            form="post-edit-form"
            disabled={saving || autoSaveState === 'saving'}
            className="flex-1"
          >
            {t('actions.save')}
          </Button>
        </div>
      </div>

      <DeleteDialog />
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
        onConfirm={() => {
          setPublishConfirmOpen(false);
          void savePost();
        }}
      />
    </div>
  );
}
