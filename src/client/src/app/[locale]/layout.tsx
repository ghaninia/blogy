import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { geistMono, geistSans, vazirmatn } from '@/lib/fonts';
import { locales, type Locale } from '@/i18n/request';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProviders } from '@/components/providers';
import { fetchSiteConfig } from '@/lib/site-config';
import { SiteHeader } from '@/components/layout/site-header';
import { getMediaUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = await fetchSiteConfig(locale);
  const title = config.metaTitle || config.name;
  const description = config.metaDescription || config.description || config.tagline;
  const favicon = config.faviconPath ? getMediaUrl(config.faviconPath) : undefined;
  const socialImage = config.ogImagePath ? getMediaUrl(config.ogImagePath) : undefined;
  const keywords = config.metaKeywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title,
    description: description || undefined,
    keywords: keywords.length ? keywords : undefined,
    robots: config.robots,
    verification: config.googleVerification
      ? { google: config.googleVerification }
      : undefined,
    icons: favicon ? { icon: favicon, shortcut: favicon } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      siteName: config.name,
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title,
      description: description || undefined,
      images: socialImage ? [socialImage] : undefined,
      creator: config.twitterHandle || undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const config = await fetchSiteConfig(locale);
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  const isFa = locale === 'fa';
  const structuredData = config.structuredData
    ? JSON.stringify(config.structuredData).replace(/</g, '\\u003c')
    : null;

  return (
    <html
      lang={locale}
      dir={dir}
      data-accent={config.accentColor}
      suppressHydrationWarning
      className={cn(
        geistMono.variable,
        isFa
          ? cn(vazirmatn.variable, vazirmatn.className)
          : cn(geistSans.variable, geistSans.className),
      )}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {structuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        ) : null}
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <ThemeProvider>
              <SiteHeader
                name={config.name}
                logoPath={config.logoPath}
                locale={locale}
                items={config.headerNavigation}
              />
              {children}
            </ThemeProvider>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
