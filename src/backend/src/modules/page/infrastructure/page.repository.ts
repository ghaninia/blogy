import { prisma } from '../../../db/index.js';

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

  findMany(publicOnly: boolean) {
    return prisma.page.findMany({
      where: publicOnly ? { isPublished: true } : undefined,
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export const pageRepository = new PageRepository();
