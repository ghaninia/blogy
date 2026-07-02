export interface MediaRef {
  id: string;
  path: string;
  altFa?: string | null;
  altEn?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface PostSummary {
  id: string;
  slug: string;
  titleFa?: string | null;
  titleEn?: string | null;
  excerptFa?: string | null;
  excerptEn?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  coverMedia?: MediaRef | null;
}

export interface PostDetail extends PostSummary {
  contentFa?: string | null;
  contentEn?: string | null;
  metaTitleFa?: string | null;
  metaTitleEn?: string | null;
  metaDescFa?: string | null;
  metaDescEn?: string | null;
  author?: { displayName?: string | null; username: string; avatarUrl?: string | null } | null;
  categories?: { category: { slug: string; nameFa: string; nameEn: string } }[];
  tags?: { tag: { slug: string; nameFa: string; nameEn: string } }[];
}

export interface PortfolioSummary {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
  coverMedia?: MediaRef | null;
  sortOrder: number;
}

export interface PageDetail {
  id: string;
  slug: string;
  type: string;
  titleFa?: string | null;
  titleEn?: string | null;
  contentFa?: string | null;
  contentEn?: string | null;
  metaTitleFa?: string | null;
  metaTitleEn?: string | null;
  metaDescFa?: string | null;
  metaDescEn?: string | null;
}
