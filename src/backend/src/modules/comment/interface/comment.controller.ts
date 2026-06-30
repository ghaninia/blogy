import { Router } from 'express';
import { Role, CommentStatus } from '../../../db/index.js';
import { createCommentSchema, moderateCommentSchema, commentQuerySchema } from '../../../types/index.js';
import { commentService } from '../application/comment.service.js';
import { authenticate, authorize, optionalAuth, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { commentRateLimiter } from '../../../shared/security/rate-limit.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId, isEditorRole } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', authenticate, authorize(Role.ADMIN, Role.EDITOR), validate(commentQuerySchema, 'query'), async (req, res, next) => {
  try {
    const q = req.query as { page?: number; limit?: number; status?: CommentStatus; postId?: string };
    const result = await commentService.listAll(q.page, q.limit, q.status, q.postId);
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

router.get('/post/:postId', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const comments = await commentService.listForPost(paramId(req.params.postId), publicOnly);
    sendSuccess(res, comments);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/post/:postId',
  authenticate,
  commentRateLimiter,
  validate(createCommentSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const comment = await commentService.create(paramId(req.params.postId), req.user!.id, req.body);
      sendSuccess(res, comment, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id/moderate',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(moderateCommentSchema),
  async (req, res, next) => {
    try {
      const comment = await commentService.moderate(paramId(req.params.id), req.body);
      sendSuccess(res, comment);
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
      const result = await commentService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const commentRouter = router;
