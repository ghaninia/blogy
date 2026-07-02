import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BlogPostList } from '@/components/blog/blog-post-list';
import { BLOG_PAGE_SIZE, fetchCategory, fetchPosts, fetchTag } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, titleFont } from '@/lib/utils';

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { locale } = await params;
  const { category: categoryId, tag: tagId } = await searchParams;
  const t = await getTranslations('blog');
  const tNav = await getTranslations('nav');
  const config = await fetchSiteConfig(locale);
  const filters = { categoryId, tagId };
  const { data: posts, meta } = await fetchPosts(BLOG_PAGE_SIZE, 1, filters);
  const isFa = locale === 'fa';
  const total = meta?.total ?? posts?.length ?? 0;
  const hasFilter = Boolean(categoryId || tagId);

  let filterLabel: string | null = null;
  if (categoryId) {
    const { data: category } = await fetchCategory(categoryId);
    if (category) filterLabel = isFa ? category.nameFa : category.nameEn;
  } else if (tagId) {
    const { data: tag } = await fetchTag(tagId);
    if (tag) filterLabel = isFa ? tag.nameFa : tag.nameEn;
  }

  return (
    <>
      <main className="py-10">
        <Container>
          <Breadcrumb
            items={[
              { label: tNav('home'), href: `/${locale}` },
              { label: t('title') },
            ]}
          />

          <header className="mb-8 border-b border-border pb-6">
            <h1 className={titleFont(locale, 'text-xl font-medium leading-tight sm:text-2xl')}>
              {t('title')}
            </h1>
            {hasFilter && filterLabel ? (
              <p className={cn('mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', isFa && 'font-fa')}>
                <span className="text-muted-foreground">
                  {categoryId ? t('filteredByCategory', { name: filterLabel }) : t('filteredByTag', { name: filterLabel })}
                </span>
                <Link
                  href={`/${locale}/blog`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {t('clearFilter')}
                </Link>
              </p>
            ) : total > 0 ? (
              <p className={cn('mt-2 text-sm text-muted-foreground', isFa && 'font-fa')}>
                {total} {t('postsCount')}
              </p>
            ) : null}
          </header>

          <BlogPostList
            initialPosts={posts ?? []}
            initialMeta={meta}
            locale={locale}
            pageSize={BLOG_PAGE_SIZE}
            filters={filters}
          />
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
