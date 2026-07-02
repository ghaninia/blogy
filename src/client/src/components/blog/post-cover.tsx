import Image from 'next/image';
import type { MediaRef } from '@/lib/types';
import { getMediaUrl } from '@/lib/api';
import { getLocalizedField } from '@/lib/utils';

export function PostCover({
  cover,
  title,
  locale,
}: {
  cover?: MediaRef | null;
  title: string;
  locale: string;
}) {
  if (!cover?.path) return null;

  const alt = getLocalizedField(cover, 'alt', locale) || title;
  const src = getMediaUrl(cover.path);

  return (
    <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 640px) 100vw, 640px"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
