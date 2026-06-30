import { PostStatus } from '../../../db/index.js';
import type { CreatePostInput, PostQueryInput, UpdatePostInput } from '../../../types/index.js';
import { sanitizeOptionalFields } from '../../../shared/security/sanitize.js';
import { postRepository } from '../infrastructure/post.repository.js';
import { postNotFound, slugExists } from '../domain/post.errors.js';

export class PostService {
  async create(input: CreatePostInput, authorId: string) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'contentFa',
      'contentEn',
    ]) as CreatePostInput;

    const existing = await postRepository.findBySlugOnly(sanitized.slug);
    if (existing) throw slugExists();

    const { categoryIds, tagIds, ...data } = sanitized;

    return postRepository.create({
      ...data,
      authorId,
      categories: categoryIds?.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      tags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    });
  }

  async update(id: string, input: UpdatePostInput) {
    const sanitized = sanitizeOptionalFields(input as Record<string, unknown>, [
      'contentFa',
      'contentEn',
    ]) as UpdatePostInput;

    const post = await postRepository.findById(id);
    if (!post) throw postNotFound();

    if (sanitized.slug && sanitized.slug !== post.slug) {
      const existing = await postRepository.findBySlugOnly(sanitized.slug);
      if (existing) throw slugExists();
    }

    const { categoryIds, tagIds, ...data } = sanitized;

    if (categoryIds) {
      await postRepository.deleteCategories(id);
    }
    if (tagIds) {
      await postRepository.deleteTags(id);
    }

    return postRepository.update(id, {
      ...data,
      categories: categoryIds?.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      tags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await postRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const post = await postRepository.findById(id);
    if (!post) throw postNotFound();
    return post;
  }

  async getBySlug(slug: string, publicOnly = false) {
    const post = await postRepository.findBySlug(slug);
    if (!post) throw postNotFound();
    if (publicOnly && post.status !== PostStatus.PUBLISHED) {
      throw postNotFound();
    }
    return post;
  }

  async list(query: PostQueryInput, publicOnly = false) {
    const { page, limit, status, categoryId, tagId, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(publicOnly ? { status: PostStatus.PUBLISHED } : status ? { status } : {}),
      ...(categoryId && { categories: { some: { categoryId } } }),
      ...(tagId && { tags: { some: { tagId } } }),
      ...(search && {
        OR: [
          { titleFa: { contains: search, mode: 'insensitive' as const } },
          { titleEn: { contains: search, mode: 'insensitive' as const } },
          { excerptFa: { contains: search, mode: 'insensitive' as const } },
          { excerptEn: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      postRepository.findMany(where, skip, limit),
      postRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const postService = new PostService();
