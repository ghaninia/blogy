import type { MetadataRoute } from 'next';

const locales = ['fa', 'en'] as const;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

const staticPaths = ['', '/blog', '/portfolio', '/about', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }

  return entries;
}
