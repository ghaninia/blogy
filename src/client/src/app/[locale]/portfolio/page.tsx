import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { fetchPortfolio } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/api';
import { cn, getLocalizedField } from '@/lib/utils';

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('portfolio');
  const config = await fetchSiteConfig(locale);
  const { data: items } = await fetchPortfolio(50);

  return (
    <>
      <SiteHeader name={config.name} />
      <main className="py-10">
        <Container>
          <h1 className={cn('mb-8 text-xl font-medium', locale === 'fa' && 'font-fa')}>{t('title')}</h1>
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
                      <p className={cn('font-medium', locale === 'fa' && 'font-fa')}>{title}</p>
                    </div>
                  </Link>
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
