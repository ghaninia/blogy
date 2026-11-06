import { z } from 'zod';
import { paginationSchema } from './common.js';

export const subscriberStatusSchema = z.enum(['ACTIVE', 'UNSUBSCRIBED']);
export const campaignStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'ARCHIVED']);

export const subscriberQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  status: subscriberStatusSchema.optional(),
});

export const createSubscriberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  name: z.string().trim().max(120).optional(),
  status: subscriberStatusSchema.default('ACTIVE'),
});

export const publicSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  consent: z.literal(true),
});

export const updateSubscriberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase())
    .optional(),
  name: z.string().trim().max(120).optional(),
  status: subscriberStatusSchema.optional(),
});

export const newsletterCampaignQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  status: campaignStatusSchema.optional(),
});

export const createNewsletterCampaignSchema = z.object({
  title: z.string().trim().min(1).max(160),
  subject: z.string().trim().min(1).max(200),
  previewText: z.string().trim().max(240).optional(),
  content: z.string().min(1).max(100000),
  status: campaignStatusSchema.default('DRAFT'),
  scheduledAt: z.coerce.date().optional(),
});

export const updateNewsletterCampaignSchema = createNewsletterCampaignSchema.partial();

export type SubscriberQueryInput = z.infer<typeof subscriberQuerySchema>;
export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;
export type PublicSubscribeInput = z.infer<typeof publicSubscribeSchema>;
export type UpdateSubscriberInput = z.infer<typeof updateSubscriberSchema>;
export type NewsletterCampaignQueryInput = z.infer<typeof newsletterCampaignQuerySchema>;
export type CreateNewsletterCampaignInput = z.infer<typeof createNewsletterCampaignSchema>;
export type UpdateNewsletterCampaignInput = z.infer<typeof updateNewsletterCampaignSchema>;
