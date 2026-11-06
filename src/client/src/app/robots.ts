import type { MetadataRoute } from 'next';
import { fetchSiteConfig, getSiteBaseUrl } from '@/lib/site-config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await fetchSiteConfig('en');
  const baseUrl = getSiteBaseUrl(config.siteUrl);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    ...(config.sitemapEnabled ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  };
}
