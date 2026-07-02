import { prisma, type Prisma } from '../../../db/index.js';

export class ExperienceRepository {
  findById(id: string) {
    return prisma.experience.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.experience.create>[0]['data']) {
    return prisma.experience.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.experience.update>[0]['data']) {
    return prisma.experience.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.experience.delete({ where: { id } });
  }

  findMany(where: Prisma.ExperienceWhereInput, skip: number, take: number) {
    return prisma.experience.findMany({
      where,
      skip,
      take,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    });
  }

  count(where: Prisma.ExperienceWhereInput) {
    return prisma.experience.count({ where });
  }
}

export const experienceRepository = new ExperienceRepository();
