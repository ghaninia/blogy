'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Eye, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@gh/ui';
import { api, getPaginationMeta } from '@/shared/api-client';
import { formatDate } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@gh/ui';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { RichTextEditor } from '@/features/posts/components/rich-text-editor';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  previewText?: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
  scheduledAt?: string;
  updatedAt: string;
}

interface CampaignForm {
  title: string;
  subject: string;
  previewText: string;
  content: string;
  scheduledAt: string;
}

const emptyForm = (): CampaignForm => ({
  title: '',
  subject: '',
  previewText: '',
  content: '',
  scheduledAt: '',
});

const STATUS_VARIANT: Record<Campaign['status'], 'secondary' | 'warning'> = {
  DRAFT: 'secondary',
  SCHEDULED: 'warning',
  ARCHIVED: 'secondary',
};

function toLocalDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function DashboardNewsletterPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tn = useTranslations('dashboard.newsletterPage');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const toastText = useTranslations('dashboard.toast');
  const common = useTranslations('common');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebouncedValue(search);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const { items, meta, isLoading, isError, refetch } = useCrudList<Campaign>({
    queryKey: ['dashboard-newsletter-campaigns'],
    endpoint: '/api/newsletter/campaigns',
    params: {
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'all' ? undefined : status,
    },
  });

  const { data: subscriberMeta } = useQuery({
    queryKey: ['newsletter-active-subscribers'],
    queryFn: async () => {
      const response = await api.get<unknown[]>('/api/subscribers', {
        page: 1,
        limit: 1,
        status: 'ACTIVE',
      });
      return getPaginationMeta(response);
    },
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  };

  const openEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setForm({
      title: campaign.title,
      subject: campaign.subject,
      previewText: campaign.previewText ?? '',
      content: campaign.content,
      scheduledAt: toLocalDateTime(campaign.scheduledAt),
    });
    setEditorOpen(true);
  };

  const save = async (nextStatus: 'DRAFT' | 'SCHEDULED') => {
    if (!form.title.trim() || !form.subject.trim() || !stripHtml(form.content)) {
      toast({ title: tn('validation'), variant: 'destructive' });
      return;
    }
    if (
      nextStatus === 'SCHEDULED' &&
      (!form.scheduledAt || new Date(form.scheduledAt).getTime() <= Date.now())
    ) {
      toast({ title: tn('validation'), variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      previewText: form.previewText.trim() || undefined,
      content: form.content,
      status: nextStatus,
      scheduledAt:
        nextStatus === 'SCHEDULED' ? new Date(form.scheduledAt).toISOString() : undefined,
    };
    try {
      if (editingId) await api.patch(`/api/newsletter/campaigns/${editingId}`, payload);
      else await api.post('/api/newsletter/campaigns', payload);
      await queryClient.invalidateQueries({ queryKey: ['dashboard-newsletter-campaigns'] });
      toast({ title: toastText('saved'), variant: 'success' });
      setEditorOpen(false);
    } catch {
      toast({
        title: toastText('error'),
        description: nextStatus === 'SCHEDULED' ? tn('validation') : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const archive = async (campaign: Campaign) => {
    try {
      await api.patch(`/api/newsletter/campaigns/${campaign.id}`, { status: 'ARCHIVED' });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-newsletter-campaigns'] });
      toast({ title: toastText('saved'), variant: 'success' });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    }
  };

  const remove = (campaign: Campaign) => {
    confirmDelete({
      description: tn('deleteConfirm', { title: campaign.title }),
      onConfirm: async () => {
        try {
          await api.delete(`/api/newsletter/campaigns/${campaign.id}`);
          await queryClient.invalidateQueries({ queryKey: ['dashboard-newsletter-campaigns'] });
          toast({ title: toastText('deleted'), variant: 'success' });
        } catch {
          toast({ title: toastText('error'), variant: 'destructive' });
        }
      },
    });
  };

  const actions = (campaign: Campaign) => (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${tn('preview')}: ${campaign.title}`}
        onClick={() => setPreviewCampaign(campaign)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${t('actions.edit')}: ${campaign.title}`}
        onClick={() => openEdit(campaign)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {campaign.status !== 'ARCHIVED' ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${tn('archive')}: ${campaign.title}`}
          onClick={() => void archive(campaign)}
        >
          <Archive className="h-4 w-4" />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${t('actions.delete')}: ${campaign.title}`}
        onClick={() => remove(campaign)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t('newsletter')}
        description={tn('description')}
        action={
          <Button type="button" onClick={openNew}>
            <Plus className="me-2 h-4 w-4" />
            {tn('newCampaign')}
          </Button>
        }
      />
      <div
        className="mb-5 flex flex-col gap-3 rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        role="note"
      >
        <p className="text-sm leading-6">{tn('providerNotice')}</p>
        <Badge variant="secondary" className="shrink-0">
          {subscriberMeta?.total ?? '—'} {tn('activeSubscribers')}
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={tt('search')}
          className="max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label={tt('status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tn('allStatuses')}</SelectItem>
            <SelectItem value="DRAFT">{ts('DRAFT')}</SelectItem>
            <SelectItem value="SCHEDULED">{ts('SCHEDULED')}</SelectItem>
            <SelectItem value="ARCHIVED">{ts('ARCHIVED')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && items.length === 0}
        emptyTitle={tn('noCampaigns')}
        emptyDescription={tn('emptyDescription')}
        items={items}
        mobileCardRender={(campaign) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{campaign.title}</p>
                <p className="truncate text-xs text-muted-foreground">{campaign.subject}</p>
              </div>
              <Badge variant={STATUS_VARIANT[campaign.status]}>{ts(campaign.status)}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{campaign.scheduledAt ? tn('scheduledFor') : tt('date')}</span>
              <span>{formatDate(campaign.scheduledAt ?? campaign.updatedAt, locale)}</span>
            </div>
            {actions(campaign)}
          </div>
        )}
        pagination={{ page, meta, onPageChange: setPage }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tn('title')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead>{tn('scheduledFor')}</TableHead>
              <TableHead>{tt('date')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <button
                    type="button"
                    className="text-start font-medium hover:text-primary"
                    onClick={() => openEdit(campaign)}
                  >
                    {campaign.title}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {campaign.subject}
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[campaign.status]}>{ts(campaign.status)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {campaign.scheduledAt ? formatDate(campaign.scheduledAt, locale) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(campaign.updatedAt, locale)}
                </TableCell>
                <TableCell className="text-end">{actions(campaign)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? tn('editingCampaign') : tn('newCampaign')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <FormField label={tn('title')}>
                <Input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </FormField>
              <FormField label={tn('subject')}>
                <Input
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                />
              </FormField>
              <FormField label={tn('previewText')}>
                <Input
                  value={form.previewText}
                  onChange={(event) => setForm({ ...form, previewText: event.target.value })}
                />
              </FormField>
              <FormField label={tn('content')}>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm((current) => ({ ...current, content }))}
                  placeholder={tn('content')}
                />
              </FormField>
            </div>
            <aside className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">{tn('audience')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscriberMeta?.total ?? '—'} {tn('activeSubscribers')}
                </p>
              </div>
              <FormField label={tn('scheduledAt')}>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
                />
              </FormField>
              <p className="text-xs leading-5 text-muted-foreground">{tn('deliveryUnavailable')}</p>
            </aside>
          </div>
          <DialogFooter className="flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              {common('cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void save('DRAFT')}
            >
              {tn('saveDraft')}
            </Button>
            <Button type="button" disabled={saving} onClick={() => void save('SCHEDULED')}>
              <Send className="me-2 h-4 w-4" />
              {tn('schedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewCampaign} onOpenChange={(open) => !open && setPreviewCampaign(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tn('preview')}</DialogTitle>
          </DialogHeader>
          {previewCampaign ? (
            <article
              className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-5 sm:p-8"
              dir={locale === 'fa' ? 'rtl' : 'ltr'}
            >
              <p className="text-xs text-muted-foreground">{previewCampaign.previewText}</p>
              <h2 className="mt-4 text-xl font-semibold">{previewCampaign.subject}</h2>
              <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                {stripHtml(previewCampaign.content)}
              </div>
            </article>
          ) : null}
        </DialogContent>
      </Dialog>
      <DeleteDialog />
    </div>
  );
}
