import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/motion/text-effect';
import { getMediaUrl } from '@/lib/api';
import type { PortfolioSummary } from '@/lib/types';
import { cn, getLocalizedField } from '@/lib/utils';

export function ProjectsSection({
  items,
  locale,
  title,
  viewAllLabel,
}: {
  items: PortfolioSummary[];
  locale: string;
  title: string;
  viewAllLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <FadeIn className="py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <Link
          href={`/${locale}/portfolio`}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const name = getLocalizedField(item, 'title', locale);
          const desc = getLocalizedField(item, 'description', locale);
          const cover = item.coverMedia?.path ? getMediaUrl(item.coverMedia.path) : '';

          return (
            <Link
              key={item.id}
              href={`/${locale}/portfolio/${item.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-muted/30 transition-colors hover:bg-muted/60"
            >
              {cover ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image
                    src={cover}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted" />
              )}
              <div className="p-4">
                <p className={cn('font-medium', locale === 'fa' && 'font-fa')}>{name}</p>
                {desc ? (
                  <p
                    className={cn(
                      'mt-1 line-clamp-2 text-sm text-muted-foreground',
                      locale === 'fa' && 'font-fa',
                    )}
                  >
                    {desc.replace(/<[^>]+>/g, ' ').trim()}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </FadeIn>
  );
}
