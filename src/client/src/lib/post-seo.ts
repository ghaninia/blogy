import type { Metadata } from 'next';
import type { PostDetail } from './types';
import { getMediaUrl } from './api';
import { getPostShareUrl } from './share';
import { getLocalizedField } from './utils';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getPostCanonicalUrl(post: PostDetail, locale: string, slug: string) {
  const customUrl = post.canonicalUrl?.trim();
  if (customUrl) {
    try {
      const parsed = new URL(customUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    } catch {
      // Invalid legacy values fall back to the canonical localized route.
    }
  }
  return getPostShareUrl(locale, slug);
}

export function getPostSeoData(post: PostDetail, locale: string, slug: string) {
  const isFa = locale === 'fa';
  const title =
    getLocalizedField(post, 'metaTitle', locale) || getLocalizedField(post, 'title', locale);
  const description =
    getLocalizedField(post, 'metaDesc', locale) ||
    stripHtml(getLocalizedField(post, 'excerpt', locale));
  const url = getPostCanonicalUrl(post, locale, slug);
  const shareMedia = post.socialImageMedia ?? post.coverMedia;
  const cover = shareMedia?.path ? getMediaUrl(shareMedia.path) : undefined;
  const authorName = post.author?.displayName || post.author?.username || undefined;
  const tagNames = post.tags?.map((item) => (isFa ? item.tag.nameFa : item.tag.nameEn)) ?? [];
  const categoryNames =
    post.categories?.map((item) => (isFa ? item.category.nameFa : item.category.nameEn)) ?? [];
  const keywords = [...categoryNames, ...tagNames];
  const publishedTime = post.publishedAt ?? post.createdAt;

  return {
    title,
    description,
    url,
    cover,
    shareMedia,
    authorName,
    tagNames,
    categoryNames,
    keywords,
    publishedTime,
    isFa,
  };
}

export function buildPostMetadata(post: PostDetail, locale: string, slug: string): Metadata {
  const {
    title,
    description,
    url,
    cover,
    shareMedia,
    authorName,
    tagNames,
    categoryNames,
    keywords,
    publishedTime,
  } = getPostSeoData(post, locale, slug);

  return {
    title,
    description: description || undefined,
    keywords: keywords.length ? keywords : undefined,
    authors: authorName ? [{ name: authorName }] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: description || undefined,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'article',
      url,
      publishedTime,
      modifiedTime: publishedTime,
      authors: authorName ? [authorName] : undefined,
      tags: tagNames.length ? tagNames : undefined,
      section: categoryNames[0],
      images: cover
        ? [
            {
              url: cover,
              alt: title,
              width: shareMedia?.width ?? undefined,
              height: shareMedia?.height ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description: description || undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

export function buildPostJsonLd(post: PostDetail, locale: string, slug: string) {
  const { title, description, url, cover, authorName, categoryNames, keywords, publishedTime } =
    getPostSeoData(post, locale, slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || undefined,
    datePublished: publishedTime,
    dateModified: publishedTime,
    url,
    mainEntityOfPage: url,
    inLanguage: locale === 'fa' ? 'fa-IR' : 'en-US',
    ...(cover ? { image: [cover] } : {}),
    ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
    ...(categoryNames.length ? { articleSection: categoryNames.join(', ') } : {}),
    ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
  };
}
