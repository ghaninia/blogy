import type { CreatePageInput, UpdatePageInput } from '../../../types/index.js';
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

  async getById(id: string) {
    const page = await pageRepository.findById(id);
    if (!page) throw pageNotFound();
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

  async list(publicOnly = false) {
    return pageRepository.findMany(publicOnly);
  }
}

export const pageService = new PageService();
