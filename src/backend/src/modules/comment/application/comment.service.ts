import { CommentStatus, PostStatus } from '../../../db/index.js';
import type { CreateCommentInput, ModerateCommentInput } from '../../../types/index.js';
import { verifyRecaptcha } from '../../../shared/security/recaptcha.js';
import sanitizeHtml from 'sanitize-html';
import { commentRepository } from '../infrastructure/comment.repository.js';
import { commentNotFound, postNotFound, invalidParent, commentsDisabled } from '../domain/comment.errors.js';

export class CommentService {
  async create(postId: string, userId: string, input: CreateCommentInput) {
    await verifyRecaptcha(input.recaptchaToken);

    const post = await commentRepository.findPostById(postId);
    if (!post || post.status !== PostStatus.PUBLISHED) throw postNotFound();
    if (!post.commentsEnabled) throw commentsDisabled();

    if (input.parentId) {
      const parent = await commentRepository.findById(input.parentId);
      if (!parent || parent.postId !== postId) {
        throw invalidParent();
      }
    }

    const content = sanitizeHtml(input.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    return commentRepository.create({
      content,
      postId,
      userId,
      parentId: input.parentId,
      status: CommentStatus.PENDING,
    });
  }

  async moderate(id: string, input: ModerateCommentInput) {
    await this.getById(id);
    return commentRepository.update(id, { status: input.status });
  }

  async delete(id: string) {
    await this.getById(id);
    await commentRepository.delete(id);
    return { deleted: true };
  }

  async getById(id: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) throw commentNotFound();
    return comment;
  }

  async listForPost(postId: string, publicOnly = true) {
    const post = await commentRepository.findPostById(postId);
    if (!post) throw postNotFound();
    if (publicOnly && (!post.commentsEnabled || post.status !== PostStatus.PUBLISHED)) {
      return [];
    }

    return commentRepository.findForPost(postId, publicOnly);
  }

  async listAll(page = 1, limit = 20, status?: CommentStatus, postId?: string) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { status }),
      ...(postId && { postId }),
    };

    const [items, total] = await Promise.all([
      commentRepository.findAll(where, skip, limit),
      commentRepository.count(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const commentService = new CommentService();
