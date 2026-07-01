'use client';

import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Search, Upload } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Pagination,
  Spinner,
  useToast,
} from '@gh/ui';
import { api, getMediaUrl, getPaginationMeta } from '@/shared/api-client';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
  url?: string;
  variants?: Record<string, string>;
}

interface MediaManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  mode?: 'single' | 'multi';
}

export function MediaManager({ open, onClose, onSelect, mode = 'single' }: MediaManagerProps) {
  const t = useTranslations('dashboard.mediaManager');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['media-picker', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get<MediaItem[]>('/api/media', {
        search: debouncedSearch || undefined,
        page,
        limit: 24,
      });
      return {
        items: res.data ?? [],
        meta: getPaginationMeta(res),
      };
    },
    enabled: open,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.upload('/api/media/upload', file);
      await refetch();
      toast({ title: t('uploadSuccess'), variant: 'success' });
    } catch (err) {
      toast({
        title: t('uploadError'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSelect = (item: MediaItem) => {
    onSelect(item);
    if (mode === 'single') onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('search')}
              className="ps-9"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf"
            onChange={handleUpload}
          />
          <Button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload className="me-2 h-4 w-4" />
            {uploading ? t('uploading') : t('upload')}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : isError ? (
            <EmptyState title={t('loadError')} />
          ) : !data?.items.length ? (
            <EmptyState title={t('empty')} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="group overflow-hidden rounded-lg border border-border bg-card elevated-sm transition hover:border-primary hover:brightness-105"
                >
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
                    <div className="flex aspect-square items-center justify-center bg-muted text-xs text-muted-foreground">
                      {item.mimeType}
                    </div>
                  )}
                  <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{item.originalName}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {data?.meta && data.meta.totalPages > 1 ? (
          <div className="flex justify-center border-t border-border px-4 py-3">
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          </div>
        ) : null}

        {mode === 'multi' ? (
          <div className="flex justify-end border-t border-border px-4 py-3 sm:px-6">
            <Button onClick={onClose}>{t('done')}</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
