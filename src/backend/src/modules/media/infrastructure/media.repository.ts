import { prisma, type Prisma } from '../../../db/index.js';

export class MediaRepository {
  create(data: Parameters<typeof prisma.media.create>[0]['data']) {
    return prisma.media.create({ data });
  }

  findById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  }

  findMany(where: Prisma.MediaWhereInput, skip: number, take: number) {
    return prisma.media.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  }

  count(where: Prisma.MediaWhereInput) {
    return prisma.media.count({ where });
  }

  delete(id: string) {
    return prisma.media.delete({ where: { id } });
  }

  update(id: string, data: Prisma.MediaUpdateInput) {
    return prisma.media.update({ where: { id }, data });
  }
}

export const mediaRepository = new MediaRepository();
