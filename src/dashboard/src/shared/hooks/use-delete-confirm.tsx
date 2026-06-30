'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@gh/ui';

interface ConfirmOptions {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
}

export function useDeleteConfirm() {
  const t = useTranslations('dashboard.confirm');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmDelete = useCallback((options: ConfirmOptions) => {
    setPending(options);
    setOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!pending) return;
    setLoading(true);
    try {
      await pending.onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
      setPending(null);
    }
  };

  function DeleteDialog() {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title ?? t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.description ?? t('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={loading}>
              {tc('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { confirmDelete, DeleteDialog };
}
