import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { fetchPostBySlug } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, formatDate, getLocalizedField, titleFont } from '@/lib/utils';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');
  const tNav = await getTranslations('nav');
  const config = await fetchSiteConfig(locale);
  const { data: post } = await fetchPostBySlug(slug);

  if (!post) notFound();

  const title = getLocalizedField(post, 'title', locale);
  const content = getLocalizedField(post, 'content', locale);
  const date = post.publishedAt ?? post.createdAt;
  const isFa = locale === 'fa';

  return (
    <>
      <ReadingProgress />
      <main className="py-10">
        <Container>
          <Breadcrumb
            items={[
              { label: tNav('home'), href: `/${locale}` },
              { label: t('title'), href: `/${locale}/blog` },
              { label: title },
            ]}
          />

          <article data-reading-article className="border-t border-border pt-8">
            <header className="mb-8">
              <h1
                className={titleFont(
                  locale,
                  'text-pretty text-xl font-medium leading-tight tracking-tight sm:text-2xl',
                )}
              >
                {title}
              </h1>
              <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                {t('publishedOn')} {formatDate(date, locale)}
              </p>
            </header>

            {content ? (
              <div
                className={cn(
                  'rich-content border-t border-border pt-8',
                  isFa && 'font-fa word-spacing-[0.06em]',
                )}
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
