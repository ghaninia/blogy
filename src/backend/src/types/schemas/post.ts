import { z } from 'zod';
import { postStatusSchema, slugSchema } from './common.js';

export const createPostSchema = z.object({
  slug: slugSchema,
  titleFa: z.string().max(300).optional(),
  titleEn: z.string().max(300).optional(),
  excerptFa: z.string().max(10000).optional(),
  excerptEn: z.string().max(10000).optional(),
  contentFa: z.string().optional(),
  contentEn: z.string().optional(),
  status: postStatusSchema.default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
  coverMediaId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  metaTitleFa: z.string().max(200).optional(),
  metaTitleEn: z.string().max(200).optional(),
  metaDescFa: z.string().max(300).optional(),
  metaDescEn: z.string().max(300).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: postStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  search: z.string().optional(),
  locale: z.enum(['fa', 'en']).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
