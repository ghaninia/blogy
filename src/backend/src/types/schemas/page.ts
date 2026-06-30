import { z } from 'zod';
import { pageTypeSchema, paginationSchema, slugSchema } from './common.js';

export const createPageSchema = z.object({
  slug: slugSchema,
  type: pageTypeSchema.default('CUSTOM'),
  titleFa: z.string().max(300).optional(),
  titleEn: z.string().max(300).optional(),
  contentFa: z.string().optional(),
  contentEn: z.string().optional(),
  isPublished: z.boolean().default(false),
  metaTitleFa: z.string().max(200).optional(),
  metaTitleEn: z.string().max(200).optional(),
  metaDescFa: z.string().max(300).optional(),
  metaDescEn: z.string().max(300).optional(),
});

export const updatePageSchema = createPageSchema.partial();

export const pageQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageQueryInput = z.infer<typeof pageQuerySchema>;
