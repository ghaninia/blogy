export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
}

export function getPublicSiteHomeUrl(locale: string): string {
  return `${getPublicSiteUrl()}/${locale}`;
}
