'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeIn } from '@/components/motion/text-effect';
import { AnimatedListItem } from '@/components/motion/animated-background';
import type { PostSummary } from '@/lib/types';
import { cn, getLocalizedField } from '@/lib/utils';

export function BlogSection({
  posts,
  locale,
  title,
  viewAllLabel,
}: {
  posts: PostSummary[];
  locale: string;
  title: string;
  viewAllLabel: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (posts.length === 0) return null;

  return (
    <FadeIn className="py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <Link
          href={`/${locale}/blog`}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      </div>
      <div className="space-y-1">
        {posts.map((post) => {
          const postTitle = getLocalizedField(post, 'title', locale);
          const excerpt = getLocalizedField(post, 'excerpt', locale)
            .replace(/<[^>]+>/g, ' ')
            .trim();

          return (
            <AnimatedListItem
              key={post.id}
              id={post.id}
              active={activeId === post.id}
              className="px-2 py-2"
            >
              <Link
                href={`/${locale}/blog/${post.slug}`}
                onMouseEnter={() => setActiveId(post.id)}
                onMouseLeave={() => setActiveId(null)}
                className="block"
              >
                <p className={cn('font-medium', locale === 'fa' && 'font-fa')}>{postTitle}</p>
                {excerpt ? (
                  <p
                    className={cn(
                      'mt-0.5 line-clamp-1 text-sm text-muted-foreground',
                      locale === 'fa' && 'font-fa',
                    )}
                  >
                    {excerpt}
                  </p>
                ) : null}
              </Link>
            </AnimatedListItem>
          );
        })}
      </div>
    </FadeIn>
  );
}
