import { z } from 'zod';
import { slugSchema } from './common.js';

export const createTagSchema = z.object({
  slug: slugSchema,
  nameFa: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
});

export const updateTagSchema = createTagSchema.partial();

export const tagQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagQueryInput = z.infer<typeof tagQuerySchema>;
