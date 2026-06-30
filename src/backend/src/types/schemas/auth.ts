import { z } from 'zod';
import { passwordSchema, recaptchaSchema, roleSchema } from './common.js';

export const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    password: passwordSchema,
    displayName: z.string().min(1).max(100).optional(),
  })
  .merge(recaptchaSchema);

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .merge(recaptchaSchema);

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateUserRoleSchema = z.object({
  role: roleSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
