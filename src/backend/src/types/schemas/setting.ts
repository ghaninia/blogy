import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  valueFa: z.string().optional(),
  valueEn: z.string().optional(),
  valueJson: z.record(z.unknown()).optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
