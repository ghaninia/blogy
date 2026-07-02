import { apiGet } from './api';
import type { PageDetail, PortfolioSummary, PostDetail, PostListFilters, PostSummary } from './types';

export interface PostsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const BLOG_PAGE_SIZE = 10;

export interface ExperienceItem {
  id: string;
  titleFa: string;
  titleEn: string;
  companyFa: string;
  companyEn: string;
  startDate: string;
  endDate?: string | null;
  sortOrder: number;
}


export async function fetchPosts(
  limit = BLOG_PAGE_SIZE,
  page = 1,
  filters: PostListFilters = {},
) {
  const result = await apiGet<PostSummary[]>('/api/posts', {
    limit,
    page,
    categoryId: filters.categoryId,
    tagId: filters.tagId,
  });
  const meta = result.meta as Partial<PostsListMeta> | undefined;
  return {
    data: result.data,
    meta: meta
      ? {
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          total: meta.total ?? result.data?.length ?? 0,
          totalPages: meta.totalPages ?? 1,
        }
      : null,
  };
}

export async function fetchPostBySlug(slug: string) {
  return apiGet<PostDetail>(`/api/posts/slug/${slug}`);
}

export async function fetchCategory(id: string) {
  return apiGet<{ id: string; slug: string; nameFa: string; nameEn: string }>(
    `/api/categories/${id}`,
  );
}

export async function fetchTag(id: string) {
  return apiGet<{ id: string; slug: string; nameFa: string; nameEn: string }>(`/api/tags/${id}`);
}

export async function fetchPortfolio(limit = 4) {
  return apiGet<PortfolioSummary[]>('/api/portfolio', { limit, page: 1 });
}

export async function fetchPortfolioBySlug(slug: string) {
  return apiGet<PortfolioSummary & { contentFa?: string; contentEn?: string }>(
    `/api/portfolio/slug/${slug}`,
  );
}

export async function fetchPageBySlug(slug: string) {
  return apiGet<PageDetail>(`/api/pages/slug/${slug}`);
}

export async function fetchExperiences() {
  return apiGet<ExperienceItem[]>('/api/experiences', { limit: 20, page: 1 });
}
