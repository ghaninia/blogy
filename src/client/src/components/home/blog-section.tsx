'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/motion/text-effect';
import type { PostSummary } from '@/lib/types';
import { cn, getLocalizedField, titleFont } from '@/lib/utils';

const spring = { type: 'spring' as const, bounce: 0.12, duration: 0.45 };

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (posts.length === 0) return null;

  return (
    <FadeIn className="py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={titleFont(locale, 'text-sm font-medium text-foreground')}>{title}</h2>
        <Link
          href={`/${locale}/blog`}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      </div>
      <div className="flex flex-col gap-0.5" onMouseLeave={() => setHoveredIndex(null)}>
        {posts.map((post, index) => {
          const postTitle = getLocalizedField(post, 'title', locale);
          const excerpt = getLocalizedField(post, 'excerpt', locale)
            .replace(/<[^>]+>/g, ' ')
            .trim();

          const isHovered = hoveredIndex === index;
          const isBelow = hoveredIndex !== null && index > hoveredIndex;
          const depth = isBelow ? index - hoveredIndex! : 0;

          return (
            <div key={post.id} className="relative px-2 py-2">
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg bg-muted/70"
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={spring}
              />
              <motion.div
                className="relative will-change-transform"
                animate={{
                  rotate: isBelow ? 0.8 + depth * 0.25 : 0,
                  opacity: isBelow ? 0.78 - depth * 0.05 : 1,
                }}
                transition={spring}
                style={{ transformOrigin: 'top center' }}
              >
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    'block transition-colors',
                    isHovered ? 'text-foreground' : 'text-foreground/90',
                  )}
                >
                  <p className={titleFont(locale, 'font-medium leading-snug')}>{postTitle}</p>
                  {excerpt ? (
                    <p
                      className={cn(
                        'mt-0.5 line-clamp-1 text-sm leading-snug text-muted-foreground',
                        locale === 'fa' && 'font-fa',
                      )}
                    >
                      {excerpt}
                    </p>
                  ) : (
                    <span className="mt-0.5 block h-5" aria-hidden />
                  )}
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
