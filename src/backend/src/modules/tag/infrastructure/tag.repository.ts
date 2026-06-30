import { prisma } from '../../../db/index.js';

export class TagRepository {
  findBySlug(slug: string) {
    return prisma.tag.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.tag.create>[0]['data']) {
    return prisma.tag.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.tag.update>[0]['data']) {
    return prisma.tag.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.tag.delete({ where: { id } });
  }

  findAll() {
    return prisma.tag.findMany({ orderBy: { nameEn: 'asc' } });
  }
}

export const tagRepository = new TagRepository();
