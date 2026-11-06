import { z } from 'zod';
import { recaptchaSchema } from './common.js';

export const createCommentSchema = z
  .object({
    content: z.string().min(1).max(2000),
    parentId: z.string().uuid().optional(),
  })
  .merge(recaptchaSchema);

export const moderateCommentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SPAM']),
});

export const bulkCommentActionSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'Comment IDs must be unique'),
  action: z.enum(['APPROVED', 'REJECTED', 'SPAM', 'DELETE']),
});

export const moderatorReplySchema = z.object({ content: z.string().trim().min(1).max(2000) });

export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']).optional(),
  postId: z.string().uuid().optional(),
  search: z.string().trim().max(200).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type BulkCommentActionInput = z.infer<typeof bulkCommentActionSchema>;
