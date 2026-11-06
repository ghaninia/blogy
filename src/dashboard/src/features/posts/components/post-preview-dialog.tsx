'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Monitor, Smartphone } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@gh/ui';

interface PostPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  title: string;
  excerpt: string;
  content: string;
}

export function PostPreviewDialog({
  open,
  onOpenChange,
  locale,
  title,
  excerpt,
  content,
}: PostPreviewDialogProps) {
  const t = useTranslations('dashboard.editor');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const source = useMemo(() => `<!doctype html><html lang="${locale}" dir="${locale === 'fa' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    *{box-sizing:border-box}body{margin:0;padding:32px;color:#17191f;background:#fff;font:16px/1.9 system-ui,-apple-system,sans-serif}main{max-width:760px;margin:0 auto}h1{font-size:2rem;line-height:1.35;margin:0 0 14px} .excerpt{color:#737782;font-size:1.1rem;margin:0 0 30px}article img{max-width:100%;height:auto;border-radius:10px}article pre{overflow:auto;padding:16px;background:#f1f2f6;border-radius:8px}article blockquote{border-inline-start:3px solid #635bff;margin-inline:0;padding-inline-start:16px;color:#737782}a{color:#635bff}
    </style></head><body><main><h1>${escapeHtml(title || t('untitledPreview'))}</h1>${excerpt ? `<p class="excerpt">${escapeHtml(excerpt)}</p>` : ''}<article>${content || ''}</article></main></body></html>`, [content, excerpt, locale, t, title]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col gap-3 overflow-hidden">
        <DialogHeader className="flex-row items-center justify-between gap-4">
          <DialogTitle>{t('preview')}</DialogTitle>
          <div className="flex gap-1" role="group" aria-label={t('previewDevice')}>
            <Button type="button" size="sm" variant={device === 'desktop' ? 'secondary' : 'ghost'} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} aria-label={t('desktopPreview')}>
              <Monitor className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant={device === 'mobile' ? 'secondary' : 'ghost'} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} aria-label={t('mobilePreview')}>
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 justify-center overflow-auto rounded-xl bg-muted/40 p-3 sm:p-5">
          <iframe
            title={t('preview')}
            sandbox=""
            srcDoc={source}
            className={`min-h-[65vh] rounded-lg border border-border bg-white transition-[width] ${device === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'}`}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('previewSandboxHint')}</p>
      </DialogContent>
    </Dialog>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}
