'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Search } from 'lucide-react';
import { api, getMediaUrl } from '@/shared/api-client';
import { Input } from '@gh/ui';

interface MediaItem {
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
}

export function MediaManager({ open, onClose, onSelect }: MediaManagerProps) {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['media', search],
    queryFn: async () => {
      const res = await api.get<MediaItem[]>('/api/media', { search, limit: 48 });
      return res.data ?? [];
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
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Media Manager</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b px-6 py-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="ps-9"
            />
          </div>
          <label className="cursor-pointer">
            <input type="file" className="hidden" accept="image/*,video/*,.pdf" onChange={handleUpload} />
            <span className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              <Upload className="me-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </span>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {data?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md"
                >
                  {item.mimeType.startsWith('image/') ? (
                    <div className="relative aspect-square">
                      <Image
                        src={item.url ?? getMediaUrl(item.path)}
                        alt={item.originalName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-gray-100 text-xs text-gray-500">
                      {item.mimeType}
                    </div>
                  )}
                  <p className="truncate px-2 py-1 text-xs text-gray-600">{item.originalName}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
