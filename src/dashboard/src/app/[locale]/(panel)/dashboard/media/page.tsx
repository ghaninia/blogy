'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Upload, Trash2 } from 'lucide-react';
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
  Pagination,
  useToast,
} from '@gh/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api, getMediaUrl } from '@/shared/api-client';
import { canDeletePost } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { useCrudList } from '@/shared/hooks/use-crud-list';
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
  altFa?: string;
  altEn?: string;
}

export default function DashboardMediaPage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const tc = useTranslations('common');
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

  const { items, meta, isLoading } = useCrudList<MediaItem>({
    queryKey: ['dashboard-media'],
    endpoint: '/api/media',
    params: { page, limit: 24, search: debouncedSearch || undefined },
  });

  const canDelete = user ? canDeletePost(user.role) : false;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.upload('/api/media/upload', file);
      toast({ title: tToast('uploaded'), variant: 'success' });
      qc.invalidateQueries({ queryKey: ['dashboard-media'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
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

  return (
    <div>
      <PageHeader
        title={t('media')}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Input
              placeholder={tt('search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-48"
            />
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/*,video/*,.pdf" onChange={handleUpload} />
              <span className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto">
                <Upload className="me-2 h-4 w-4" />
                {uploading ? tc('loading') : t('actions.upload')}
              </span>
            </label>
          </div>
        }
      />

      <Card variant="glass">
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-muted-foreground">{tc('loading')}</p>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground">{tt('empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <button type="button" className="w-full" onClick={() => openEdit(item)}>
                    {item.mimeType.startsWith('image/') ? (
                      <div className="relative aspect-square">
                        <Image
                          src={getMediaUrl(item.path)}
                          alt={item.originalName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-muted text-xs">
                        {item.mimeType}
                      </div>
                    )}
                    <div className="p-2 text-start">
                      <p className="truncate text-xs">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="absolute end-2 top-2 rounded bg-destructive p-1 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 ? (
            <div className="mt-6 flex justify-center">
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tf('editMetadata')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label={tf('altFa')}>
              <Input value={metaForm.altFa} onChange={(e) => setMetaForm({ ...metaForm, altFa: e.target.value })} />
            </FormField>
            <FormField label={tf('altEn')}>
              <Input value={metaForm.altEn} onChange={(e) => setMetaForm({ ...metaForm, altEn: e.target.value })} />
            </FormField>
            <FormField label={tf('folder')}>
              <Input value={metaForm.folder} onChange={(e) => setMetaForm({ ...metaForm, folder: e.target.value })} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>{tc('cancel')}</Button>
            <Button onClick={saveMetadata} disabled={savingMeta}>{t('actions.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog />
    </div>
  );
}
