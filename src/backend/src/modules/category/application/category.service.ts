import type { CreateCategoryInput, UpdateCategoryInput } from '../../../types/index.js';
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

  async list() {
    return categoryRepository.listRoots();
  }
}

export const categoryService = new CategoryService();
