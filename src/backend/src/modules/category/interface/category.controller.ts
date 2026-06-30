import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { categoryQuerySchema, createCategorySchema, updateCategorySchema } from '../../../types/index.js';
import { categoryService } from '../application/category.service.js';
import { authenticate, authorize } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', validate(categoryQuerySchema, 'query'), async (req, res, next) => {
  try {
    const result = await categoryService.list(req.query as never);
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

router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.getById(paramId(req.params.id));
    sendSuccess(res, category);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(createCategorySchema),
  async (req, res, next) => {
    try {
      const category = await categoryService.create(req.body);
      sendSuccess(res, category, 201);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(updateCategorySchema),
  async (req, res, next) => {
    try {
      const category = await categoryService.update(paramId(req.params.id), req.body);
      sendSuccess(res, category);
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
      const result = await categoryService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

export const categoryRouter = router;
