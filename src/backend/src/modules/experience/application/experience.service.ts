import type {
  CreateExperienceInput,
  ExperienceQueryInput,
  UpdateExperienceInput,
} from '../../../types/index.js';
import { experienceRepository } from '../infrastructure/experience.repository.js';
import { experienceNotFound } from '../domain/experience.errors.js';

function parseDate(value: string) {
  return new Date(value);
}

export class ExperienceService {
  async create(input: CreateExperienceInput) {
    return experienceRepository.create({
      titleFa: input.titleFa,
      titleEn: input.titleEn,
      companyFa: input.companyFa,
      companyEn: input.companyEn,
      startDate: parseDate(input.startDate),
      endDate: input.endDate ? parseDate(input.endDate) : null,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    });
  }

  async update(id: string, input: UpdateExperienceInput) {
    await this.getById(id);
    return experienceRepository.update(id, {
      ...(input.titleFa !== undefined ? { titleFa: input.titleFa } : {}),
      ...(input.titleEn !== undefined ? { titleEn: input.titleEn } : {}),
      ...(input.companyFa !== undefined ? { companyFa: input.companyFa } : {}),
      ...(input.companyEn !== undefined ? { companyEn: input.companyEn } : {}),
      ...(input.startDate !== undefined ? { startDate: parseDate(input.startDate) } : {}),
      ...(input.endDate !== undefined
        ? { endDate: input.endDate ? parseDate(input.endDate) : null }
        : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await experienceRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const item = await experienceRepository.findById(id);
    if (!item) throw experienceNotFound();
    return item;
  }

  async list(query: ExperienceQueryInput, publicOnly = false) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(publicOnly ? { isPublished: true } : {}),
      ...(search && {
        OR: [
          { titleFa: { contains: search, mode: 'insensitive' as const } },
          { titleEn: { contains: search, mode: 'insensitive' as const } },
          { companyFa: { contains: search, mode: 'insensitive' as const } },
          { companyEn: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      experienceRepository.findMany(where, skip, limit),
      experienceRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const experienceService = new ExperienceService();
