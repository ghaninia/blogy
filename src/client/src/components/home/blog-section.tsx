'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeIn } from '@/components/motion/text-effect';
import type { PostSummary } from '@/lib/types';
import { cn, getLocalizedField, titleFont } from '@/lib/utils';
import { BlogHoverItem } from '@/components/blog/blog-hover-item';

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
        <h2 className={titleFont(locale, 'text-sm font-medium leading-tight text-foreground')}>{title}</h2>
        <Link
          href={`/${locale}/blog`}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      </div>
      <div className="flex flex-col gap-0.5" onMouseLeave={() => setActiveId(null)}>
        {posts.map((post) => {
          const postTitle = getLocalizedField(post, 'title', locale);
          const excerpt = getLocalizedField(post, 'excerpt', locale)
            .replace(/<[^>]+>/g, ' ')
            .trim();

          return (
            <BlogHoverItem
              key={post.id}
              layoutId="home-blog-highlight"
              className="py-2"
              active={activeId === post.id}
              onEnter={() => setActiveId(post.id)}
              href={`/${locale}/blog/${post.slug}`}
            >
              <p className={titleFont(locale, 'font-medium leading-snug')}>{postTitle}</p>
              {excerpt ? (
                <p
                  className={cn(
                    'mt-0.5 line-clamp-1 text-sm leading-normal text-muted-foreground',
                    locale === 'fa' && 'font-fa',
                  )}
                >
                  {excerpt}
                </p>
              ) : (
                <span className="mt-0.5 block h-5" aria-hidden />
              )}
            </BlogHoverItem>
          );
        })}
      </div>
    </FadeIn>
  );
}
