import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { fetchPageBySlug } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { cn, getLocalizedField } from '@/lib/utils';

interface ContentPageProps {
  params: Promise<{ locale: string }>;
  slug: string;
  backHref: string;
  backLabelKey: 'backHome' | 'backToBlog';
}

export async function renderContentPage({
  params,
  slug,
  backHref,
  backLabelKey,
}: ContentPageProps) {
  const { locale } = await params;
  const t = await getTranslations('common');
  const config = await fetchSiteConfig(locale);
  const { data: page } = await fetchPageBySlug(slug);

  if (!page) notFound();

  const title = getLocalizedField(page, 'title', locale);
  const content = getLocalizedField(page, 'content', locale);

  return (
    <>
      <ReadingProgress />
      <SiteHeader name={config.name} />
      <main className="py-10">
        <Container>
          <Link
            href={backHref}
            className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t(backLabelKey)}
          </Link>
          <article data-reading-article>
            <h1 className={cn('text-2xl font-medium tracking-tight', locale === 'fa' && 'font-fa')}>
              {title}
            </h1>
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

export async function contentPageMetadata(
  params: Promise<{ locale: string }>,
  slug: string,
): Promise<Metadata> {
  const { locale } = await params;
  const config = await fetchSiteConfig(locale);
  const { data: page } = await fetchPageBySlug(slug);

  if (!page) return { title: config.name };

  const title = getLocalizedField(page, 'title', locale);
  const description =
    getLocalizedField(page, 'metaDesc', locale) || config.metaDescription;

  return {
    title: `${title} | ${config.name}`,
    description,
  };
}
