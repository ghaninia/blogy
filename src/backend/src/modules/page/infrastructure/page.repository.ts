import { prisma, type Prisma } from '../../../db/index.js';

export class PageRepository {
  findBySlug(slug: string) {
    return prisma.page.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return prisma.page.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.page.create>[0]['data']) {
    return prisma.page.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.page.update>[0]['data']) {
    return prisma.page.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.page.delete({ where: { id } });
  }

  findMany(where: Prisma.PageWhereInput, skip: number, take: number) {
    return prisma.page.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
  }

  count(where: Prisma.PageWhereInput) {
    return prisma.page.count({ where });
  }
}

export const pageRepository = new PageRepository();
