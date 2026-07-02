export function buildShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}\n${url}`);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
  };
}

export function getPostShareUrl(locale: string, slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  return `${base.replace(/\/$/, '')}/${locale}/blog/${slug}`;
}
