import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { createPortfolioSchema, updatePortfolioSchema } from '../../../types/index.js';
import { portfolioService } from '../application/portfolio.service.js';
import { authenticate, authorize, optionalAuth, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId, isEditorRole } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const items = await portfolioService.list(publicOnly);
    sendSuccess(res, items);
  } catch (e) {
    next(e);
  }
});

router.get('/slug/:slug', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const item = await portfolioService.getBySlug(paramId(req.params.slug), publicOnly);
    sendSuccess(res, item);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(createPortfolioSchema),
  async (req, res, next) => {
    try {
      const item = await portfolioService.create(req.body);
      sendSuccess(res, item, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(updatePortfolioSchema),
  async (req, res, next) => {
    try {
      const item = await portfolioService.update(paramId(req.params.id), req.body);
      sendSuccess(res, item);
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
      const result = await portfolioService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const portfolioRouter = router;
