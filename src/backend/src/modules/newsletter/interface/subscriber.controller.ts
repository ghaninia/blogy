import { Router } from 'express';
import { Role } from '../../../db/index.js';
import {
  createSubscriberSchema,
  publicSubscribeSchema,
  subscriberQuerySchema,
  updateSubscriberSchema,
} from '../../../types/index.js';
import { authenticate, authorize } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';
import { subscriberService } from '../application/subscriber.service.js';
import { publicSubscribeRateLimiter } from '../../../shared/security/rate-limit.js';

const router: Router = Router();
const staff = [Role.ADMIN, Role.EDITOR] as const;

router.get(
  '/',
  authenticate,
  authorize(...staff),
  validate(subscriberQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await subscriberService.list(req.query as never);
      sendSuccess(res, result.items, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/subscribe',
  publicSubscribeRateLimiter,
  validate(publicSubscribeSchema),
  async (req, res, next) => {
    try {
      sendSuccess(res, await subscriberService.subscribePublic(req.body));
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  authenticate,
  authorize(...staff),
  validate(createSubscriberSchema),
  async (req, res, next) => {
    try {
      sendSuccess(res, await subscriberService.create(req.body), 201);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(...staff),
  validate(updateSubscriberSchema),
  async (req, res, next) => {
    try {
      sendSuccess(res, await subscriberService.update(paramId(req.params.id), req.body));
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/:id', authenticate, authorize(...staff), async (req, res, next) => {
  try {
    sendSuccess(res, await subscriberService.delete(paramId(req.params.id)));
  } catch (error) {
    next(error);
  }
});

export const subscriberRouter = router;
