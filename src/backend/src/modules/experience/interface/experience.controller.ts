import { Router } from 'express';
import { Role } from '../../../db/index.js';
import {
  createExperienceSchema,
  experienceQuerySchema,
  updateExperienceSchema,
} from '../../../types/index.js';
import { experienceService } from '../application/experience.service.js';
import { experienceNotFound } from '../domain/experience.errors.js';
import { authenticate, authorize, optionalAuth, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId, isEditorRole } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', validate(experienceQuerySchema, 'query'), optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const publicOnly = !req.user || !isEditorRole(req.user.role);
    const result = await experienceService.list(req.query as never, publicOnly);
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

router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const item = await experienceService.getById(paramId(req.params.id));
    if ((!req.user || !isEditorRole(req.user.role)) && !item.isPublished) {
      throw experienceNotFound();
    }
    sendSuccess(res, item);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(createExperienceSchema),
  async (req, res, next) => {
    try {
      const item = await experienceService.create(req.body);
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
  validate(updateExperienceSchema),
  async (req, res, next) => {
    try {
      const item = await experienceService.update(paramId(req.params.id), req.body);
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
      const result = await experienceService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const experienceRouter = router;
