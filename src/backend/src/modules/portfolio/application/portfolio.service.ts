import type { CreatePortfolioInput, PortfolioQueryInput, UpdatePortfolioInput } from '../../../types/index.js';
import { sanitizeOptionalFields } from '../../../shared/security/sanitize.js';
import { portfolioRepository } from '../infrastructure/portfolio.repository.js';
import { portfolioNotFound, slugExists } from '../domain/portfolio.errors.js';

export class PortfolioService {
  async create(input: CreatePortfolioInput) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'descriptionFa',
      'descriptionEn',
    ]) as CreatePortfolioInput;

    const existing = await portfolioRepository.findBySlug(sanitized.slug);
    if (existing) throw slugExists();
    return portfolioRepository.create(sanitized);
  }

  async update(id: string, input: UpdatePortfolioInput) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'descriptionFa',
      'descriptionEn',
    ]) as UpdatePortfolioInput;

    await this.getById(id);
    if (sanitized.slug) {
      const existing = await portfolioRepository.findBySlug(sanitized.slug);
      if (existing && existing.id !== id) {
        throw slugExists();
      }
    }
    return portfolioRepository.update(id, sanitized);
  }

  async delete(id: string) {
    await this.getById(id);
    await portfolioRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const item = await portfolioRepository.findById(id);
    if (!item) throw portfolioNotFound();
    return item;
  }

  async getBySlug(slug: string, publicOnly = false) {
    const item = await portfolioRepository.findBySlug(slug);
    if (!item) throw portfolioNotFound();
    if (publicOnly && !item.isPublished) {
      throw portfolioNotFound();
    }
    return item;
  }

  async list(query: PortfolioQueryInput, publicOnly = false) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(publicOnly ? { isPublished: true } : {}),
      ...(search && {
        OR: [
          { titleFa: { contains: search, mode: 'insensitive' as const } },
          { titleEn: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      portfolioRepository.findMany(where, skip, limit),
      portfolioRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const portfolioService = new PortfolioService();
