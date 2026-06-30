import type { CategoryQueryInput, CreateCategoryInput, UpdateCategoryInput } from '../../../types/index.js';
import { categoryRepository } from '../infrastructure/category.repository.js';
import { categoryNotFound, slugExists } from '../domain/category.errors.js';

export class CategoryService {
  async create(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) throw slugExists();
    return categoryRepository.create(input);
  }

  async update(id: string, input: UpdateCategoryInput) {
    await this.getById(id);
    if (input.slug) {
      const existing = await categoryRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw slugExists();
      }
    }
    return categoryRepository.update(id, input);
  }

  async delete(id: string) {
    await this.getById(id);
    await categoryRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw categoryNotFound();
    return category;
  }

  async list(query: CategoryQueryInput) {
    const { all, page, limit, search } = query;
    const wantsPagination =
      all !== true && (page !== undefined || limit !== undefined || search !== undefined);

    if (!wantsPagination) {
      const items = await categoryRepository.listRoots();
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length || 1,
        totalPages: 1,
      };
    }

    const resolvedPage = page ?? 1;
    const resolvedLimit = limit ?? 20;
    const skip = (resolvedPage - 1) * resolvedLimit;

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
      categoryRepository.findMany(where, skip, resolvedLimit),
      categoryRepository.count(where),
    ]);

    return {
      items,
      total,
      page: resolvedPage,
      limit: resolvedLimit,
      totalPages: Math.ceil(total / resolvedLimit),
    };
  }
}

export const categoryService = new CategoryService();
