import type { PostSummary } from './types';

export interface PostsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchPostsPage(
  page: number,
  limit: number,
): Promise<{ data: PostSummary[]; meta: PostsListMeta | null }> {
  const url = new URL(`${API_URL}/api/posts`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString());
  if (!res.ok) return { data: [], meta: null };

  const json = (await res.json()) as {
    success: boolean;
    data?: PostSummary[];
    meta?: Partial<PostsListMeta>;
  };

  if (!json.success || !json.data) return { data: [], meta: null };

  const meta = json.meta;
  return {
    data: json.data,
    meta: meta
      ? {
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          total: meta.total ?? json.data.length,
          totalPages: meta.totalPages ?? 1,
        }
      : null,
  };
}
