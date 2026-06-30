import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { createTagSchema, updateTagSchema } from '../../../types/index.js';
import { tagService } from '../application/tag.service.js';
import { authenticate, authorize } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const tags = await tagService.list();
    sendSuccess(res, tags);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(createTagSchema),
  async (req, res, next) => {
    try {
      const tag = await tagService.create(req.body);
      sendSuccess(res, tag, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(updateTagSchema),
  async (req, res, next) => {
    try {
      const tag = await tagService.update(paramId(req.params.id), req.body);
      sendSuccess(res, tag);
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
      const result = await tagService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const tagRouter = router;
