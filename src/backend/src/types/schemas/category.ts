import { z } from 'zod';
import { slugSchema } from './common.js';

export const createCategorySchema = z.object({
  slug: slugSchema,
  nameFa: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  descriptionFa: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
