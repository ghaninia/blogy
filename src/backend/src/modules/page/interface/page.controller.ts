import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { createPageSchema, pageQuerySchema, updatePageSchema } from '../../../types/index.js';
import { pageService } from '../application/page.service.js';
import { authenticate, authorize, optionalAuth, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId, isEditorRole } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', validate(pageQuerySchema, 'query'), optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const result = await pageService.list(req.query as never, publicOnly);
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
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const page = await pageService.getBySlug(paramId(req.params.slug), publicOnly);
    sendSuccess(res, page);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const page = await pageService.getById(paramId(req.params.id));
    sendSuccess(res, page);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(createPageSchema),
  async (req, res, next) => {
    try {
      const page = await pageService.create(req.body);
      sendSuccess(res, page, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(updatePageSchema),
  async (req, res, next) => {
    try {
      const page = await pageService.update(paramId(req.params.id), req.body);
      sendSuccess(res, page);
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  async (req, res, next) => {
    try {
      const result = await pageService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const pageRouter = router;
