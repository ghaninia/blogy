import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './shared/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/', '/(fa|en)/:path*'],
};
