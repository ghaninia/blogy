import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { createPostSchema, updatePostSchema, postQuerySchema } from '../../../types/index.js';
import { postService } from '../application/post.service.js';
import { postRepository } from '../infrastructure/post.repository.js';
import { authenticate, authorize, authorizeOwnerOrRole, optionalAuth, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId, isStaffRole } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', validate(postQuerySchema, 'query'), optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isStaffRole(req.user.role);
    const result = await postService.list(req.query as never, publicOnly);
    sendSuccess(res, result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/slug/:slug', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isStaffRole(req.user.role);
    const post = await postService.getBySlug(paramId(req.params.slug), publicOnly);
    sendSuccess(res, post);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isStaffRole(req.user.role);
    const post = await postService.getById(paramId(req.params.id), publicOnly);
    sendSuccess(res, post);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR, Role.AUTHOR),
  validate(createPostSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const post = await postService.create(req.body, req.user!.id);
      sendSuccess(res, post, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorizeOwnerOrRole(
    async (req) => {
      const post = await postRepository.findById(paramId(req.params.id));
      return post?.authorId ?? null;
    },
    Role.ADMIN,
    Role.EDITOR,
  ),
  validate(updatePostSchema),
  async (req, res, next) => {
    try {
      const post = await postService.update(paramId(req.params.id), req.body);
      sendSuccess(res, post);
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  async (req, res, next) => {
    try {
      const result = await postService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const postRouter = router;
