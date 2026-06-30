import { prisma } from '../../../db/index.js';

export class CategoryRepository {
  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
  }

  create(data: Parameters<typeof prisma.category.create>[0]['data']) {
    return prisma.category.create({ data, include: { children: true } });
  }

  update(id: string, data: Parameters<typeof prisma.category.update>[0]['data']) {
    return prisma.category.update({ where: { id }, data, include: { children: true } });
  }

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  listRoots() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: { children: { include: { children: true } } },
      orderBy: { nameEn: 'asc' },
    });
  }
}

export const categoryRepository = new CategoryRepository();
