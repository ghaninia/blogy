import { AppError } from '../../../shared/http/response.js';
import type {
  CreateNewsletterCampaignInput,
  NewsletterCampaignQueryInput,
  UpdateNewsletterCampaignInput,
} from '../../../types/index.js';
import { campaignRepository } from '../infrastructure/campaign.repository.js';

function validateSchedule(status: string, scheduledAt: Date | undefined) {
  if (status === 'SCHEDULED' && !scheduledAt) {
    throw new AppError(
      400,
      'Scheduled campaigns require a publication date',
      'SCHEDULE_DATE_REQUIRED',
    );
  }
  if (status === 'SCHEDULED' && scheduledAt && scheduledAt <= new Date()) {
    throw new AppError(
      400,
      'Choose a future date for a scheduled campaign',
      'SCHEDULE_DATE_INVALID',
    );
  }
}

export class CampaignService {
  async list(query: NewsletterCampaignQueryInput) {
    const { page, limit, search, status } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { subject: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      campaignRepository.findMany(where, (page - 1) * limit, limit),
      campaignRepository.count(where),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(input: CreateNewsletterCampaignInput) {
    validateSchedule(input.status, input.scheduledAt);
    return campaignRepository.create(input);
  }

  async update(id: string, input: UpdateNewsletterCampaignInput) {
    const current = await campaignRepository.findById(id);
    if (!current) throw new AppError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    const status = input.status ?? current.status;
    const scheduledAt = input.scheduledAt ?? current.scheduledAt ?? undefined;
    validateSchedule(status, scheduledAt);
    return campaignRepository.update(id, input);
  }

  async delete(id: string) {
    const current = await campaignRepository.findById(id);
    if (!current) throw new AppError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    await campaignRepository.delete(id);
    return { deleted: true };
  }
}

export const campaignService = new CampaignService();
