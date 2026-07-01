import type { CreatePageInput, PageQueryInput, UpdatePageInput } from '../../../types/index.js';
import { sanitizeOptionalFields } from '../../../shared/security/sanitize.js';
import { pageRepository } from '../infrastructure/page.repository.js';
import { pageNotFound, slugExists } from '../domain/page.errors.js';

export class PageService {
  async create(input: CreatePageInput) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'contentFa',
      'contentEn',
    ]) as CreatePageInput;

    const existing = await pageRepository.findBySlug(sanitized.slug);
    if (existing) throw slugExists();
    return pageRepository.create(sanitized);
  }

  async update(id: string, input: UpdatePageInput) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'contentFa',
      'contentEn',
    ]) as UpdatePageInput;

    await this.getById(id);
    if (sanitized.slug) {
      const existing = await pageRepository.findBySlug(sanitized.slug);
      if (existing && existing.id !== id) {
        throw slugExists();
      }
    }
    return pageRepository.update(id, sanitized);
  }

  async delete(id: string) {
    await this.getById(id);
    await pageRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string, publicOnly = false) {
    const page = await pageRepository.findById(id);
    if (!page) throw pageNotFound();
    if (publicOnly && !page.isPublished) {
      throw pageNotFound();
    }
    return page;
  }

  async getBySlug(slug: string, publicOnly = false) {
    const page = await pageRepository.findBySlug(slug);
    if (!page) throw pageNotFound();
    if (publicOnly && !page.isPublished) {
      throw pageNotFound();
    }
    return page;
  }

  async list(query: PageQueryInput, publicOnly = false) {
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
      pageRepository.findMany(where, skip, limit),
      pageRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const pageService = new PageService();
