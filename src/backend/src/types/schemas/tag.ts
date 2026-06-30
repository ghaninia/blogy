import { z } from 'zod';
import { slugSchema } from './common.js';

export const createTagSchema = z.object({
  slug: slugSchema,
  nameFa: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
