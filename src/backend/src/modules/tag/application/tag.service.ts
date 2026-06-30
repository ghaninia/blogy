import type { CreateTagInput, TagQueryInput, UpdateTagInput } from '../../../types/index.js';
import { tagRepository } from '../infrastructure/tag.repository.js';
import { tagNotFound, slugExists } from '../domain/tag.errors.js';

export class TagService {
  async create(input: CreateTagInput) {
    const existing = await tagRepository.findBySlug(input.slug);
    if (existing) throw slugExists();
    return tagRepository.create(input);
  }

  async update(id: string, input: UpdateTagInput) {
    await this.getById(id);
    if (input.slug) {
      const existing = await tagRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw slugExists();
      }
    }
    return tagRepository.update(id, input);
  }

  async delete(id: string) {
    await this.getById(id);
    await tagRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw tagNotFound();
    return tag;
  }

  async list(query: TagQueryInput) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nameFa: { contains: search, mode: 'insensitive' as const } },
            { nameEn: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      tagRepository.findMany(where, skip, limit),
      tagRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const tagService = new TagService();
