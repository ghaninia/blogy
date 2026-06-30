import { z } from 'zod';
import { paginationSchema, slugSchema } from './common.js';

export const createTagSchema = z.object({
  slug: slugSchema,
  nameFa: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
});

export const updateTagSchema = createTagSchema.partial();

export const tagQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagQueryInput = z.infer<typeof tagQuerySchema>;
