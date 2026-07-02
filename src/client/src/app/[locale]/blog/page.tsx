import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BlogPostList } from '@/components/blog/blog-post-list';
import { fetchPosts } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, titleFont } from '@/lib/utils';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const tNav = await getTranslations('nav');
  const config = await fetchSiteConfig(locale);
  const { data: posts } = await fetchPosts(50);
  const isFa = locale === 'fa';

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
            {posts?.length ? (
              <p className={cn('mt-2 text-sm text-muted-foreground', isFa && 'font-fa')}>
                {posts.length} {t('postsCount')}
              </p>
            ) : null}
          </header>

          {!posts?.length ? (
            <p className={cn('text-sm text-muted-foreground', isFa && 'font-fa')}>{t('empty')}</p>
          ) : (
            <BlogPostList posts={posts} locale={locale} />
          )}
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
