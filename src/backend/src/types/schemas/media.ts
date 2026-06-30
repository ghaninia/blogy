import { z } from 'zod';

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  folder: z.string().optional(),
  mimeType: z.string().optional(),
  search: z.string().optional(),
});

export const updateMediaSchema = z.object({
  altFa: z.string().max(200).optional(),
  altEn: z.string().max(200).optional(),
  folder: z.string().max(100).optional(),
});

export type MediaQueryInput = z.infer<typeof mediaQuerySchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
