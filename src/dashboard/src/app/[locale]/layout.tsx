import { vazirmatn, plusJakartaSans } from '@/shared/fonts';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales, type Locale } from '@/shared/i18n/request';
import { Providers } from '@/shared/components/providers';
import { RecaptchaProvider } from '@/features/auth/components/recaptcha-provider';
import { AuthInitializer } from '@/shared/components/auth-initializer';
import { SiteMetadataSync } from '@/shared/components/site-metadata-sync';
import { fetchSiteConfig } from '@/shared/lib/fetch-site-settings';
import { getMediaUrl } from '@/shared/api-client';
import '@gh/ui/globals.css';

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

  const title = config.metaTitle || config.name || 'Blogy';
  const description = config.metaDescription || config.tagline;
  const favicon = config.faviconPath ? getMediaUrl(config.faviconPath) : undefined;

  return {
    title,
    description: description || undefined,
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gh-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${vazirmatn.variable} ${locale === 'fa' ? vazirmatn.className : plusJakartaSans.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <RecaptchaProvider>
            <Providers>
              <AuthInitializer />
              <SiteMetadataSync />
              {children}
            </Providers>
          </RecaptchaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
