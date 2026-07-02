import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { fetchPortfolio } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/api';
import { cn, getLocalizedField, titleFont } from '@/lib/utils';

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('portfolio');
  const config = await fetchSiteConfig(locale);
  const { data: items } = await fetchPortfolio(50);

  return (
    <>
      <main className="py-10">
        <Container>
          <h1 className={titleFont(locale, 'mb-8 text-xl font-medium')}>{t('title')}</h1>
          {!items?.length ? (
            <p className="text-muted-foreground">{t('empty')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item) => {
                const title = getLocalizedField(item, 'title', locale);
                const cover = item.coverMedia?.path ? getMediaUrl(item.coverMedia.path) : '';
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/portfolio/${item.slug}`}
                    className="group overflow-hidden rounded-xl border border-border"
                  >
                    {cover ? (
                      <div className="relative aspect-[16/10] bg-muted">
                        <Image src={cover} alt={title} fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className="p-4">
                      <p className={titleFont(locale, 'font-medium')}>{title}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
