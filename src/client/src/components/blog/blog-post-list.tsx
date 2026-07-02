'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { PostSummary } from '@/lib/types';
import type { PostsListMeta } from '@/lib/data';
import { fetchPostsPage } from '@/lib/posts-client';
import { cn, formatDate, getLocalizedField, titleFont } from '@/lib/utils';
import { BlogHoverItem } from '@/components/blog/blog-hover-item';
import { Spinner } from '@/components/ui/spinner';

const itemEase = [0.25, 0.4, 0.25, 1] as const;

export function BlogPostList({
  initialPosts,
  initialMeta,
  locale,
  pageSize,
}: {
  initialPosts: PostSummary[];
  initialMeta: PostsListMeta | null;
  locale: string;
  pageSize: number;
}) {
  const t = useTranslations('blog');
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(initialMeta?.page ?? 1);
  const [totalPages, setTotalPages] = useState(initialMeta?.totalPages ?? 1);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const initialIds = useMemo(() => new Set(initialPosts.map((p) => p.id)), [initialPosts]);
  const isFa = locale === 'fa';
  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const { data, meta } = await fetchPostsPage(nextPage, pageSize);
      if (data.length > 0) {
        setPosts((prev) => [...prev, ...data]);
        setPage(nextPage);
      }
      if (meta?.totalPages) setTotalPages(meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, pageSize]);

  if (posts.length === 0) {
    return <p className={cn('text-sm text-muted-foreground', isFa && 'font-fa')}>{t('empty')}</p>;
  }

  let newItemStagger = 0;

  return (
    <>
      <div className="flex flex-col gap-0.5" onMouseLeave={() => setActiveId(null)}>
        {posts.map((post) => {
          const title = getLocalizedField(post, 'title', locale);
          const excerpt = getLocalizedField(post, 'excerpt', locale)
            .replace(/<[^>]+>/g, ' ')
            .trim();
          const date = post.publishedAt ?? post.createdAt;
          const isInitial = initialIds.has(post.id);
          const delay = isInitial ? 0 : newItemStagger++ * 0.05;

          return (
            <motion.div
              key={post.id}
              initial={isInitial ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay,
                ease: itemEase,
              }}
            >
              <BlogHoverItem
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
            </motion.div>
          );
        })}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            aria-busy={loading}
            className={cn(
              'inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-70',
              isFa && 'font-fa',
            )}
          >
            {loading ? (
              <>
                <Spinner />
                <span>{t('loading')}</span>
              </>
            ) : (
              t('loadMore')
            )}
          </button>
        </div>
      ) : posts.length > pageSize ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: itemEase }}
          className={cn('py-6 text-center text-xs text-muted-foreground', isFa && 'font-fa')}
        >
          {t('allLoaded')}
        </motion.p>
      ) : null}
    </>
  );
}
