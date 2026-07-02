'use client';

import { useState } from 'react';
import type { PostSummary } from '@/lib/types';
import { cn, formatDate, getLocalizedField, titleFont } from '@/lib/utils';
import { BlogHoverItem } from '@/components/blog/blog-hover-item';

export function BlogPostList({
  posts,
  locale,
}: {
  posts: PostSummary[];
  locale: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isFa = locale === 'fa';

  return (
    <div className="flex flex-col gap-0.5" onMouseLeave={() => setActiveId(null)}>
      {posts.map((post) => {
        const title = getLocalizedField(post, 'title', locale);
        const excerpt = getLocalizedField(post, 'excerpt', locale)
          .replace(/<[^>]+>/g, ' ')
          .trim();
        const date = post.publishedAt ?? post.createdAt;

        return (
          <BlogHoverItem
            key={post.id}
            layoutId="blog-list-highlight"
            active={activeId === post.id}
            onEnter={() => setActiveId(post.id)}
            href={`/${locale}/blog/${post.slug}`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h2 className={titleFont(locale, 'font-medium leading-snug')}>{title}</h2>
              <time
                dateTime={date}
                className="shrink-0 text-xs tabular-nums text-muted-foreground"
              >
                {formatDate(date, locale)}
              </time>
            </div>
            {excerpt ? (
              <p
                className={cn(
                  'mt-1.5 line-clamp-2 text-sm leading-normal text-muted-foreground',
                  isFa && 'font-fa word-spacing-[0.06em]',
                )}
              >
                {excerpt}
              </p>
            ) : (
              <span className="mt-1.5 block h-5" aria-hidden />
            )}
          </BlogHoverItem>
        );
      })}
    </div>
  );
}
