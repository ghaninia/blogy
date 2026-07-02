import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { BlogShare } from '@/components/blog/blog-share';
import { CommentSection } from '@/components/blog/comment-section';
import { PostCover } from '@/components/blog/post-cover';
import { PostJsonLd } from '@/components/blog/post-json-ld';
import { fetchPostBySlug } from '@/lib/data';
import { buildPostMetadata } from '@/lib/post-seo';
import { fetchSiteConfig } from '@/lib/site-config';
import { getPostShareUrl } from '@/lib/share';
import { cn, formatDate, getLocalizedField, titleFont } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: post } = await fetchPostBySlug(slug);
  if (!post) return {};

  return buildPostMetadata(post, locale, slug);
}

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
  const shareUrl = getPostShareUrl(locale, slug);
  const commentsEnabled = post.commentsEnabled ?? true;

  return (
    <>
      <PostJsonLd post={post} locale={locale} slug={slug} />
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
            <PostCover cover={post.coverMedia} title={title} locale={locale} />

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
                className={cn('rich-content border-t border-border pt-8', isFa && 'font-fa')}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : null}

            <BlogShare url={shareUrl} title={title} locale={locale} />

            {commentsEnabled ? (
              <CommentSection
                postId={post.id}
                commentsEnabled={commentsEnabled}
                locale={locale}
                returnUrl={`/${locale}/blog/${slug}`}
              />
            ) : null}
          </article>
        </Container>
      </main>
      <SiteFooter
        name={config.name}
        year={new Date().getFullYear()}
        footerCopyright={config.footerCopyright}
        footerRights={config.footerRights}
      />
    </>
  );
}
