import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { fetchPortfolioBySlug } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/api';
import { cn, getLocalizedField, titleFont } from '@/lib/utils';

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('portfolio');
  const config = await fetchSiteConfig(locale);
  const { data: item } = await fetchPortfolioBySlug(slug);

  if (!item) notFound();

  const title = getLocalizedField(item, 'title', locale);
  const description = getLocalizedField(item, 'description', locale);
  const cover = item.coverMedia?.path ? getMediaUrl(item.coverMedia.path) : '';

  return (
    <>
      <ReadingProgress />
      <main className="py-10">
        <Container>
          <Link
            href={`/${locale}/portfolio`}
            className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t('backToPortfolio')}
          </Link>
          <article data-reading-article>
          {cover ? (
            <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              <Image src={cover} alt={title} fill className="object-cover" unoptimized />
            </div>
          ) : null}
          <h1 className={titleFont(locale, 'text-2xl font-medium')}>{title}</h1>
          {description ? (
            <div
              className={cn('rich-content mt-6', locale === 'fa' && 'font-fa')}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}
          {item.technologies?.length ? (
            <div className="mt-8">
              <p className="mb-2 text-sm font-medium">{t('technologies')}</p>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-4">
            {item.projectUrl ? (
              <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-sm underline-offset-4 hover:underline">
                {t('visitProject')}
              </a>
            ) : null}
            {item.githubUrl ? (
              <a href={item.githubUrl} target="_blank" rel="noreferrer" className="text-sm underline-offset-4 hover:underline">
                {t('viewSource')}
              </a>
            ) : null}
          </div>
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
