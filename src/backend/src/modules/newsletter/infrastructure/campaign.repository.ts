import { prisma, type Prisma } from '../../../db/index.js';

export class CampaignRepository {
  findMany(where: Prisma.NewsletterCampaignWhereInput, skip: number, take: number) {
    return prisma.newsletterCampaign.findMany({
      where,
      skip,
      take,
      orderBy: [{ scheduledAt: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  count(where: Prisma.NewsletterCampaignWhereInput) {
    return prisma.newsletterCampaign.count({ where });
  }

  findById(id: string) {
    return prisma.newsletterCampaign.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.newsletterCampaign.create>[0]['data']) {
    return prisma.newsletterCampaign.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.newsletterCampaign.update>[0]['data']) {
    return prisma.newsletterCampaign.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.newsletterCampaign.delete({ where: { id } });
  }
}

export const campaignRepository = new CampaignRepository();
