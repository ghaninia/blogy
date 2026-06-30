import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/shared/i18n/request';
import { Providers } from '@/shared/components/providers';
import { RecaptchaProvider } from '@/features/auth/components/recaptcha-provider';
import { AuthInitializer } from '@/shared/components/auth-initializer';
import '@gh/ui/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} ${fontClass} min-h-screen bg-background text-foreground antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <RecaptchaProvider>
            <Providers>
              <AuthInitializer />
              {children}
            </Providers>
          </RecaptchaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
