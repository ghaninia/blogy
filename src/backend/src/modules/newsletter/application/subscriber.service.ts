import { AppError } from '../../../shared/http/response.js';
import type {
  CreateSubscriberInput,
  PublicSubscribeInput,
  SubscriberQueryInput,
  UpdateSubscriberInput,
} from '../../../types/index.js';
import { subscriberRepository } from '../infrastructure/subscriber.repository.js';

export class SubscriberService {
  async subscribePublic(input: PublicSubscribeInput) {
    await subscriberRepository.upsertPublicSubscription(input.email, new Date());
    return { accepted: true };
  }

  async list(query: SubscriberQueryInput) {
    const { page, limit, search, status } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      subscriberRepository.findMany(where, (page - 1) * limit, limit),
      subscriberRepository.count(where),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(input: CreateSubscriberInput) {
    if (await subscriberRepository.findByEmail(input.email)) {
      throw new AppError(409, 'A subscriber with this email already exists', 'SUBSCRIBER_EXISTS');
    }
    return subscriberRepository.create(input);
  }

  async update(id: string, input: UpdateSubscriberInput) {
    const current = await subscriberRepository.findById(id);
    if (!current) throw new AppError(404, 'Subscriber not found', 'SUBSCRIBER_NOT_FOUND');
    if (
      input.email &&
      input.email !== current.email &&
      (await subscriberRepository.findByEmail(input.email))
    ) {
      throw new AppError(409, 'A subscriber with this email already exists', 'SUBSCRIBER_EXISTS');
    }
    return subscriberRepository.update(id, input);
  }

  async delete(id: string) {
    const current = await subscriberRepository.findById(id);
    if (!current) throw new AppError(404, 'Subscriber not found', 'SUBSCRIBER_NOT_FOUND');
    await subscriberRepository.delete(id);
    return { deleted: true };
  }
}

export const subscriberService = new SubscriberService();
