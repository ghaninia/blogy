import { z } from 'zod';
import { postStatusSchema, slugSchema } from './common.js';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

const jsonDocumentSchema = z
  .record(jsonValueSchema)
  .refine((value) => JSON.stringify(value).length <= 500_000, 'Editor document is too large')
  .optional();

const canonicalUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value), 'Canonical URL must use HTTP or HTTPS')
  .nullable()
  .optional();

export const createPostSchema = z.object({
  slug: slugSchema,
  titleFa: z.string().max(300).optional(),
  titleEn: z.string().max(300).optional(),
  excerptFa: z.string().max(10000).optional(),
  excerptEn: z.string().max(10000).optional(),
  contentFa: z.string().optional(),
  contentEn: z.string().optional(),
  contentFaJson: jsonDocumentSchema,
  contentEnJson: jsonDocumentSchema,
  status: postStatusSchema.default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  socialImageMediaId: z.string().uuid().nullable().optional(),
  canonicalUrl: canonicalUrlSchema,
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  commentsEnabled: z.boolean().optional(),
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
  sort: z.enum(['newest', 'oldest', 'title']).default('newest'),
  locale: z.enum(['fa', 'en']).optional(),
});

export const bulkPostActionSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'Post IDs must be unique'),
  action: z.enum(['PUBLISH', 'ARCHIVE', 'DELETE']),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
export type BulkPostActionInput = z.infer<typeof bulkPostActionSchema>;
