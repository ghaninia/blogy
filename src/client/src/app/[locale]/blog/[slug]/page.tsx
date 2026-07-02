import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { fetchPostBySlug } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, formatDate, getLocalizedField } from '@/lib/utils';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');
  const config = await fetchSiteConfig(locale);
  const { data: post } = await fetchPostBySlug(slug);

  if (!post) notFound();

  const title = getLocalizedField(post, 'title', locale);
  const content = getLocalizedField(post, 'content', locale);
  const date = post.publishedAt ?? post.createdAt;

  return (
    <>
      <ReadingProgress />
      <SiteHeader name={config.name} />
      <main className="py-10">
        <Container>
          <Link
            href={`/${locale}/blog`}
            className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t('backToBlog')}
          </Link>
          <article data-reading-article>
            <h1 className={cn('text-2xl font-medium tracking-tight', locale === 'fa' && 'font-fa')}>
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('publishedOn')} {formatDate(date, locale)}
            </p>
            {content ? (
              <div
                className={cn('rich-content mt-8', locale === 'fa' && 'font-fa')}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : null}
          </article>
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
