import { z } from 'zod';
import { slugSchema } from './common.js';

export const createPortfolioSchema = z.object({
  slug: slugSchema,
  titleFa: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  descriptionFa: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  technologies: z.array(z.string()).default([]),
  coverMediaId: z.string().uuid().optional(),
  galleryMediaIds: z.array(z.string().uuid()).default([]),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
