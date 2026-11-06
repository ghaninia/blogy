import type { MetadataRoute } from 'next';
import type { PostSummary } from '@/lib/types';
import { apiGet } from '@/lib/api';
import { fetchSiteConfig, getSiteBaseUrl } from '@/lib/site-config';

const locales = ['fa', 'en'] as const;

const staticPaths = ['', '/blog', '/portfolio', '/about', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await fetchSiteConfig('en');
  if (!config.sitemapEnabled) return [];
  const baseUrl = getSiteBaseUrl(config.siteUrl);

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

  for (let page = 1; page <= 100; page += 1) {
    const { data: posts } = await apiGet<PostSummary[]>(
      '/api/posts',
      { page, limit: 100, status: 'PUBLISHED' },
      60,
    );
    if (!posts?.length) break;
    for (const post of posts) {
      let canonicalUrl: string | undefined;
      if (post.canonicalUrl) {
        try {
          const parsed = new URL(post.canonicalUrl);
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            canonicalUrl = parsed.toString();
          }
        } catch {
          // Ignore invalid legacy canonical values and use the localized post routes.
        }
      }
      const postUrls = canonicalUrl
        ? [canonicalUrl]
        : locales.map((locale) => `${baseUrl}/${locale}/blog/${encodeURIComponent(post.slug)}`);
      for (const url of postUrls) {
        entries.push({
          url,
          ...(post.updatedAt ? { lastModified: new Date(post.updatedAt) } : {}),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
    if (posts.length < 100) break;
  }

  return entries;
}
