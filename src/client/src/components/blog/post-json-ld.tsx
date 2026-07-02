import type { PostDetail } from '@/lib/types';
import { buildPostJsonLd } from '@/lib/post-seo';

export function PostJsonLd({ post, locale, slug }: { post: PostDetail; locale: string; slug: string }) {
  const jsonLd = buildPostJsonLd(post, locale, slug);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
