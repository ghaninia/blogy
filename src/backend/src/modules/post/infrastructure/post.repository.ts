import { prisma, type Prisma } from '../../../db/index.js';

export class PostRepository {
  private defaultInclude() {
    return {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      coverMedia: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    };
  }

  findBySlug(slug: string) {
    return prisma.post.findUnique({
      where: { slug },
      include: this.defaultInclude(),
    });
  }

  findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  findBySlugOnly(slug: string) {
    return prisma.post.findUnique({ where: { slug } });
  }

  create(data: Parameters<typeof prisma.post.create>[0]['data']) {
    return prisma.post.create({
      data,
      include: this.defaultInclude(),
    });
  }

  update(id: string, data: Parameters<typeof prisma.post.update>[0]['data']) {
    return prisma.post.update({
      where: { id },
      data,
      include: this.defaultInclude(),
    });
  }

  delete(id: string) {
    return prisma.post.delete({ where: { id } });
  }

  findMany(where: Prisma.PostWhereInput, skip: number, take: number) {
    return prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { publishedAt: 'desc' },
      include: this.defaultInclude(),
    });
  }

  count(where: Prisma.PostWhereInput) {
    return prisma.post.count({ where });
  }

  deleteCategories(postId: string) {
    return prisma.postCategory.deleteMany({ where: { postId } });
  }

  deleteTags(postId: string) {
    return prisma.postTag.deleteMany({ where: { postId } });
  }
}

export const postRepository = new PostRepository();
