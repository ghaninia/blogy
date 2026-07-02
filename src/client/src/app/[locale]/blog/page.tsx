import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { fetchPosts } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, formatDate, getLocalizedField } from '@/lib/utils';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const config = await fetchSiteConfig(locale);
  const { data: posts } = await fetchPosts(50);

  return (
    <>
      <SiteHeader name={config.name} />
      <main className="py-10">
        <Container>
          <h1 className={cn('mb-8 text-xl font-medium', locale === 'fa' && 'font-fa')}>{t('title')}</h1>
          {!posts?.length ? (
            <p className="text-muted-foreground">{t('empty')}</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const title = getLocalizedField(post, 'title', locale);
                const date = post.publishedAt ?? post.createdAt;
                return (
                  <article key={post.id} className="group">
                    <Link href={`/${locale}/blog/${post.slug}`} className="block">
                      <h2 className={cn('font-medium transition-colors group-hover:text-muted-foreground', locale === 'fa' && 'font-fa')}>
                        {title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(date, locale)}</p>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
