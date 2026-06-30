import { prisma, CommentStatus, type Prisma } from '../../../db/index.js';

export class CommentRepository {
  findPostById(postId: string) {
    return prisma.post.findUnique({ where: { id: postId } });
  }

  findById(id: string) {
    return prisma.comment.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.comment.create>[0]['data']) {
    return prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  update(id: string, data: Parameters<typeof prisma.comment.update>[0]['data']) {
    return prisma.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        post: { select: { id: true, slug: true, titleEn: true, titleFa: true } },
      },
    });
  }

  delete(id: string) {
    return prisma.comment.delete({ where: { id } });
  }

  findForPost(postId: string, publicOnly: boolean) {
    const where = {
      postId,
      parentId: null,
      ...(publicOnly && { status: CommentStatus.APPROVED }),
    };

    return prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        replies: {
          where: publicOnly ? { status: CommentStatus.APPROVED } : undefined,
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  findAll(where: Prisma.CommentWhereInput, skip: number, take: number) {
    return prisma.comment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        post: { select: { id: true, slug: true, titleEn: true, titleFa: true } },
      },
    });
  }

  count(where: Prisma.CommentWhereInput) {
    return prisma.comment.count({ where });
  }
}

export const commentRepository = new CommentRepository();
