import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { geistMono, geistSans, vazirmatn } from '@/lib/fonts';
import { locales, type Locale } from '@/i18n/request';
import { ThemeProvider } from '@/components/theme-provider';
import { fetchSiteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/api';
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
  const description = config.metaDescription || config.tagline;
  const favicon = config.faviconPath ? getMediaUrl(config.faviconPath) : undefined;

  return {
    title,
    description: description || undefined,
    icons: favicon ? { icon: favicon, shortcut: favicon } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
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
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  const fontClass = locale === 'fa' ? 'font-fa' : 'font-sans';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} ${fontClass} min-h-screen bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
