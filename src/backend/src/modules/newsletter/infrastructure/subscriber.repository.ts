import { prisma, type Prisma } from '../../../db/index.js';

export class SubscriberRepository {
  findMany(where: Prisma.SubscriberWhereInput, skip: number, take: number) {
    return prisma.subscriber.findMany({ where, skip, take, orderBy: { subscribedAt: 'desc' } });
  }

  count(where: Prisma.SubscriberWhereInput) {
    return prisma.subscriber.count({ where });
  }

  findById(id: string) {
    return prisma.subscriber.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return prisma.subscriber.findUnique({ where: { email } });
  }

  create(data: Parameters<typeof prisma.subscriber.create>[0]['data']) {
    return prisma.subscriber.create({ data });
  }

  upsertPublicSubscription(email: string, consentedAt: Date) {
    const subscription = {
      status: 'ACTIVE' as const,
      source: 'website',
      consentedAt,
      subscribedAt: consentedAt,
    };
    return prisma.subscriber.upsert({
      where: { email },
      create: { email, ...subscription },
      update: subscription,
      select: { id: true },
    });
  }

  update(id: string, data: Parameters<typeof prisma.subscriber.update>[0]['data']) {
    return prisma.subscriber.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.subscriber.delete({ where: { id } });
  }
}

export const subscriberRepository = new SubscriberRepository();
