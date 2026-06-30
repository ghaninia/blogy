import { z } from 'zod';

export const localeSchema = z.enum(['fa', 'en']);
export type Locale = z.infer<typeof localeSchema>;

export const roleSchema = z.enum(['ADMIN', 'EDITOR', 'AUTHOR', 'USER']);
export type Role = z.infer<typeof roleSchema>;

export const postStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const commentStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']);
export type CommentStatus = z.infer<typeof commentStatusSchema>;

export const pageTypeSchema = z.enum(['ABOUT', 'CONTACT', 'RESUME', 'CUSTOM']);
export type PageType = z.infer<typeof pageTypeSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const bilingualTextSchema = z.object({
  fa: z.string().optional(),
  en: z.string().optional(),
});

export const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

export const recaptchaSchema = z.object({
  recaptchaToken: z.string().min(1),
});
