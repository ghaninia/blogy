import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BlogPostList } from '@/components/blog/blog-post-list';
import { BLOG_PAGE_SIZE, fetchPosts } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, titleFont } from '@/lib/utils';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const tNav = await getTranslations('nav');
  const config = await fetchSiteConfig(locale);
  const { data: posts, meta } = await fetchPosts(BLOG_PAGE_SIZE, 1);
  const isFa = locale === 'fa';
  const total = meta?.total ?? posts?.length ?? 0;

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
            {total > 0 ? (
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
          />
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
