'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Copy, Grid2X2, List, Upload, Trash2, RefreshCw } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
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
import { useQueryClient } from '@tanstack/react-query';
import { api, getMediaUrl } from '@/shared/api-client';
import { canDeletePost, formatDate } from '@/shared/lib/localized';
import { cn } from '@/shared/lib/utils';
import { PageHeader } from '@/features/layout/components/page-header';
import { TablePagination } from '@/features/layout/components/table-pagination';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';

interface MediaItem {
  id: string;
  originalName: string;
  mimeType: string;
  path: string;
  url?: string;
  size: number;
  folder: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  altFa?: string;
  altEn?: string;
}

export default function DashboardMediaPage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const tc = useTranslations('common');
  const tm = useTranslations('dashboard.mediaPage');
  const locale = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [metaForm, setMetaForm] = useState({ altFa: '', altEn: '', folder: 'general' });
  const [savingMeta, setSavingMeta] = useState(false);
  const [mimeType, setMimeType] = useState('all');
  const [period, setPeriod] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);

  const { items, meta, isLoading, isError, refetch } = useCrudList<MediaItem>({
    queryKey: ['dashboard-media'],
    endpoint: '/api/media',
    params: {
      page,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      mimeType: mimeType === 'all' ? undefined : mimeType,
      createdAfter:
        period === 'all'
          ? undefined
          : new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  const canDelete = user ? canDeletePost(user.role) : false;

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        try {
          await api.upload('/api/media/upload', file);
          uploaded += 1;
        } catch {
          // Continue with the remaining files and report partial results below.
        }
      }
      if (uploaded) {
        await qc.invalidateQueries({ queryKey: ['dashboard-media'] });
        toast({
          title:
            uploaded === files.length
              ? tToast('uploaded')
              : tm('uploadPartial', { count: uploaded, total: files.length }),
          variant: uploaded === files.length ? 'success' : 'destructive',
        });
      } else {
        toast({ title: tToast('error'), variant: 'destructive' });
      }
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    await uploadFiles(Array.from(input.files ?? []));
    input.value = '';
  };

  const openEdit = (item: MediaItem) => {
    setEditItem(item);
    setMetaForm({
      altFa: item.altFa ?? '',
      altEn: item.altEn ?? '',
      folder: item.folder ?? 'general',
    });
  };

  const saveMetadata = async () => {
    if (!editItem) return;
    setSavingMeta(true);
    try {
      await api.patch(`/api/media/${editItem.id}`, metaForm);
      toast({ title: tToast('saved'), variant: 'success' });
      setEditItem(null);
      qc.invalidateQueries({ queryKey: ['dashboard-media'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDelete = (item: MediaItem) => {
    confirmDelete({
      description: t('confirm.deleteMedia'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/media/${item.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-media'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  const deleteSelected = () => {
    if (!selectedIds.size) return;
    confirmDelete({
      description: tm('bulkDeleteConfirm', { count: selectedIds.size }),
      onConfirm: async () => {
        const results = await Promise.allSettled(
          [...selectedIds].map((id) => api.delete(`/api/media/${id}`)),
        );
        const deleted = results.filter((result) => result.status === 'fulfilled').length;
        const failed = results.length - deleted;
        setSelectedIds(new Set());
        await qc.invalidateQueries({ queryKey: ['dashboard-media'] });
        toast({
          title: failed ? tm('deletePartial', { deleted, failed }) : tToast('deleted'),
          variant: failed ? 'destructive' : 'success',
        });
      },
    });
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(getMediaUrl(item.path));
      toast({ title: tm('urlCopied'), variant: 'success' });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    }
  };

  const selectVisible = () => {
    const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      items.forEach(({ id }) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        title={t('media')}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Input
              placeholder={tt('search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelectedIds(new Set());
              }}
              className="w-full sm:w-48"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                className="peer sr-only"
                accept="image/*,video/*,audio/*,.pdf"
                multiple
                onChange={handleUpload}
              />
              <span className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 sm:w-auto">
                <Upload className="me-2 h-4 w-4" />
                {uploading ? tc('loading') : t('actions.upload')}
              </span>
            </label>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectVisible}
          disabled={!items.length || !canDelete}
        >
          {items.length > 0 && items.every((item) => selectedIds.has(item.id))
            ? tm('clearSelection')
            : tm('selectVisible')}
        </Button>
        {selectedIds.size > 0 ? (
          <>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {tm('selectedCount', { count: selectedIds.size })}
            </span>
            <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={!canDelete}>
              <Trash2 className="me-2 h-4 w-4" />
              {tm('deleteSelected')}
            </Button>
          </>
        ) : null}
        <Select
          value={mimeType}
          onValueChange={(value) => {
            setMimeType(value);
            setPage(1);
            setSelectedIds(new Set());
          }}
        >
          <SelectTrigger className="w-36" aria-label={tm('typeFilter')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tm('allTypes')}</SelectItem>
            <SelectItem value="image/">{tm('images')}</SelectItem>
            <SelectItem value="video/">{tm('videos')}</SelectItem>
            <SelectItem value="audio/">{tm('audio')}</SelectItem>
            <SelectItem value="application/">{tm('documents')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={period}
          onValueChange={(value) => {
            setPeriod(value);
            setPage(1);
            setSelectedIds(new Set());
          }}
        >
          <SelectTrigger className="w-36" aria-label={tm('dateFilter')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tm('anyDate')}</SelectItem>
            <SelectItem value="30">{tm('last30Days')}</SelectItem>
            <SelectItem value="365">{tm('lastYear')}</SelectItem>
          </SelectContent>
        </Select>
        <div
          className="ms-auto inline-flex rounded-xl border border-border bg-card p-1"
          role="group"
          aria-label={tm('viewMode')}
        >
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
            aria-label={tm('gridView')}
            aria-pressed={view === 'grid'}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            aria-label={tm('listView')}
            aria-pressed={view === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card variant="glass">
        <CardContent
          className={cn(
            'relative p-6 transition-colors',
            dragActive && 'bg-primary/5 ring-2 ring-inset ring-primary/40',
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            void uploadFiles(Array.from(event.dataTransfer.files));
          }}
        >
          {dragActive ? (
            <div className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-background/90 text-sm font-semibold text-primary">
              {tm('dropFiles')}
            </div>
          ) : null}
          {isLoading ? (
            <p className="text-muted-foreground">{tc('loading')}</p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
              <p className="text-sm font-medium">{tt('loadError')}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
              >
                <RefreshCw className="me-2 h-4 w-4" />
                {tt('retry')}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-14 text-center text-muted-foreground">
              <p>{tt('empty')}</p>
              <p className="mt-1 text-sm">{tm('dropFiles')}</p>
            </div>
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  : 'space-y-2'
              }
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border border-border elevated-sm',
                    view === 'list' && 'flex items-center gap-3 p-2',
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      'w-full',
                      view === 'list' && 'flex min-w-0 items-center gap-3 text-start',
                    )}
                    onClick={() => openEdit(item)}
                  >
                    {item.mimeType.startsWith('image/') ? (
                      <div
                        className={cn(
                          'relative aspect-square',
                          view === 'list' && 'h-16 w-16 shrink-0',
                        )}
                      >
                        <Image
                          src={getMediaUrl(item.path)}
                          alt={
                            locale === 'fa'
                              ? item.altFa || item.altEn || item.originalName
                              : item.altEn || item.altFa || item.originalName
                          }
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex aspect-square items-center justify-center bg-muted text-xs',
                          view === 'list' && 'h-16 w-16 shrink-0',
                        )}
                      >
                        {item.mimeType}
                      </div>
                    )}
                    <div className={cn('min-w-0 p-2 text-start', view === 'list' && 'flex-1')}>
                      <p className="truncate text-xs">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(item.size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.width && item.height
                          ? `${item.width} × ${item.height}`
                          : item.mimeType}{' '}
                        · {formatDate(item.createdAt, locale)}
                      </p>
                    </div>
                  </button>
                  <div
                    className={cn(
                      'absolute start-2 top-2 flex gap-1',
                      view === 'list' && 'static ms-auto',
                    )}
                  >
                    {canDelete ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() =>
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          })
                        }
                        aria-label={tm('selectItem', { name: item.originalName })}
                        className="h-4 w-4 accent-primary"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void copyUrl(item)}
                      title={tm('copyUrl')}
                      aria-label={`${tm('copyUrl')}: ${item.originalName}`}
                      className="rounded-md bg-background/90 p-1.5 text-foreground shadow-sm"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label={`${t('actions.delete')}: ${item.originalName}`}
                      className={cn(
                        'absolute end-2 top-2 rounded bg-destructive p-1 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100',
                        view === 'list' && 'static me-1',
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <TablePagination
              page={page}
              meta={meta}
              onPageChange={(next) => {
                setPage(next);
                setSelectedIds(new Set());
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tf('editMetadata')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label={tf('altFa')}>
              <Input
                value={metaForm.altFa}
                onChange={(e) => setMetaForm({ ...metaForm, altFa: e.target.value })}
              />
            </FormField>
            <FormField label={tf('altEn')}>
              <Input
                value={metaForm.altEn}
                onChange={(e) => setMetaForm({ ...metaForm, altEn: e.target.value })}
              />
            </FormField>
            <FormField label={tf('folder')}>
              <Input
                value={metaForm.folder}
                onChange={(e) => setMetaForm({ ...metaForm, folder: e.target.value })}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              {tc('cancel')}
            </Button>
            <Button onClick={saveMetadata} disabled={savingMeta}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog />
    </div>
  );
}
