'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Plus, Trash2, UserRoundPlus } from 'lucide-react';
import { Badge, Button } from '@gh/ui';
import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { api, getPaginationMeta } from '@/shared/api-client';
import { formatDate } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  source: string;
  consentedAt?: string | null;
  subscribedAt: string;
}

function toCsvCell(value: string) {
  const safe = /^[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function DashboardSubscribersPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const tn = useTranslations('dashboard.subscribersPage');
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ email: '', name: '' });
  const [saving, setSaving] = useState(false);

  const { items, meta, isLoading, isError, refetch } = useCrudList<Subscriber>({
    queryKey: ['dashboard-subscribers'],
    endpoint: '/api/subscribers',
    params: {
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      search: search || undefined,
      status: status === 'all' ? undefined : status,
    },
  });

  const updateStatus = async (subscriber: Subscriber) => {
    try {
      await api.patch(`/api/subscribers/${subscriber.id}`, {
        status: subscriber.status === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE',
      });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-subscribers'] });
      toast({ title: toastText('saved'), variant: 'success' });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    }
  };

  const remove = (subscriber: Subscriber) => {
    confirmDelete({
      description: tn('deleteConfirm', { email: subscriber.email }),
      onConfirm: async () => {
        try {
          await api.delete(`/api/subscribers/${subscriber.id}`);
          await queryClient.invalidateQueries({ queryKey: ['dashboard-subscribers'] });
          toast({ title: toastText('deleted'), variant: 'success' });
        } catch {
          toast({ title: toastText('error'), variant: 'destructive' });
        }
      },
    });
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/subscribers', { email: form.email, name: form.name || undefined });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-subscribers'] });
      toast({ title: toastText('saved'), variant: 'success' });
      setDialogOpen(false);
      setForm({ email: '', name: '' });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const firstPage = await api.get<Subscriber[]>('/api/subscribers', {
        page: 1,
        limit: 100,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      });
      const pagination = getPaginationMeta(firstPage);
      const pages = await Promise.all(
        Array.from({ length: Math.max(0, (pagination?.totalPages ?? 1) - 1) }, (_, index) =>
          api.get<Subscriber[]>('/api/subscribers', {
            page: index + 2,
            limit: 100,
            search: search || undefined,
            status: status === 'all' ? undefined : status,
          }),
        ),
      );
      const exportItems = [
        ...(firstPage.data ?? []),
        ...pages.flatMap((response) => response.data ?? []),
      ];
      const rows = [
        [tn('name'), tt('email'), tt('status'), tn('source'), tn('consentDate'), tt('date')],
      ];
      for (const subscriber of exportItems) {
        rows.push([
          subscriber.name ?? '',
          subscriber.email,
          ts(subscriber.status),
          subscriber.source,
          subscriber.consentedAt ? new Date(subscriber.consentedAt).toISOString() : '',
          new Date(subscriber.subscribedAt).toISOString(),
        ]);
      }
      const csv = `\uFEFF${rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n')}`;
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'subscribers.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    }
  };

  const renderActions = (subscriber: Subscriber) => (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void updateStatus(subscriber)}
      >
        {subscriber.status === 'ACTIVE' ? tn('unsubscribe') : tn('reactivate')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${t('actions.delete')}: ${subscriber.email}`}
        onClick={() => remove(subscriber)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t('subscribers')}
        description={tn('description')}
        action={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={exportCsv}
              disabled={!items.length || isLoading}
            >
              <Download className="me-2 h-4 w-4" />
              {tn('export')}
            </Button>
            <Button type="button" onClick={() => setDialogOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              {tn('addSubscriber')}
            </Button>
          </>
        }
      />

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
            <SelectItem value="ACTIVE">{ts('active')}</SelectItem>
            <SelectItem value="UNSUBSCRIBED">{tn('unsubscribed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && items.length === 0}
        items={items}
        mobileCardRender={(subscriber) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{subscriber.name || subscriber.email}</p>
                <p className="truncate text-xs text-muted-foreground">{subscriber.email}</p>
              </div>
              <Badge variant={subscriber.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {subscriber.status === 'ACTIVE' ? ts('active') : tn('unsubscribed')}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tt('date')}</span>
              <span>{formatDate(subscriber.subscribedAt, locale)}</span>
            </div>
            {subscriber.consentedAt ? (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tn('consentDate')}</span>
                <span>{formatDate(subscriber.consentedAt, locale)}</span>
              </div>
            ) : null}
            {renderActions(subscriber)}
          </div>
        )}
        pagination={{ page, meta, onPageChange: setPage }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt('name')}</TableHead>
              <TableHead>{tt('email')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead>{tn('source')}</TableHead>
              <TableHead>{tn('consentDate')}</TableHead>
              <TableHead>{tt('date')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.name || '—'}</TableCell>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>
                  <Badge variant={subscriber.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {subscriber.status === 'ACTIVE' ? ts('active') : tn('unsubscribed')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{subscriber.source}</TableCell>
                <TableCell className="text-muted-foreground">
                  {subscriber.consentedAt ? formatDate(subscriber.consentedAt, locale) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(subscriber.subscribedAt, locale)}
                </TableCell>
                <TableCell className="text-end">{renderActions(subscriber)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tn('addSubscriber')}</DialogTitle>
          </DialogHeader>
          <form id="subscriber-form" onSubmit={create} className="space-y-4">
            <FormField label={tt('email')}>
              <Input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={tt('name')}>
              <Input
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </FormField>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {common('cancel')}
            </Button>
            <Button type="submit" form="subscriber-form" disabled={saving}>
              <UserRoundPlus className="me-2 h-4 w-4" />
              {tn('addSubscriber')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog />
    </div>
  );
}
