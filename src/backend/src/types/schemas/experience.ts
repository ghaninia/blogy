import { z } from 'zod';
import { paginationSchema } from './common.js';

export const createExperienceSchema = z.object({
  titleFa: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  companyFa: z.string().min(1).max(200),
  companyEn: z.string().min(1).max(200),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export const experienceQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type ExperienceQueryInput = z.infer<typeof experienceQuerySchema>;
