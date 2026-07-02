import { apiGet } from './api';
import type { PageDetail, PortfolioSummary, PostDetail, PostSummary } from './types';

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

export async function fetchPosts(limit = 6) {
  return apiGet<PostSummary[]>('/api/posts', { limit, page: 1 });
}

export async function fetchPostBySlug(slug: string) {
  return apiGet<PostDetail>(`/api/posts/slug/${slug}`);
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
