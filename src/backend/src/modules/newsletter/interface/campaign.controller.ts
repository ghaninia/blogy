import { Router } from 'express';
import { Role } from '../../../db/index.js';
import {
  createNewsletterCampaignSchema,
  newsletterCampaignQuerySchema,
  updateNewsletterCampaignSchema,
} from '../../../types/index.js';
import { authenticate, authorize } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';
import { campaignService } from '../application/campaign.service.js';

const router: Router = Router();
const staff = [Role.ADMIN, Role.EDITOR] as const;

router.get(
  '/campaigns',
  authenticate,
  authorize(...staff),
  validate(newsletterCampaignQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await campaignService.list(req.query as never);
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
  '/campaigns',
  authenticate,
  authorize(...staff),
  validate(createNewsletterCampaignSchema),
  async (req, res, next) => {
    try {
      sendSuccess(res, await campaignService.create(req.body), 201);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/campaigns/:id',
  authenticate,
  authorize(...staff),
  validate(updateNewsletterCampaignSchema),
  async (req, res, next) => {
    try {
      sendSuccess(res, await campaignService.update(paramId(req.params.id), req.body));
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/campaigns/:id', authenticate, authorize(...staff), async (req, res, next) => {
  try {
    sendSuccess(res, await campaignService.delete(paramId(req.params.id)));
  } catch (error) {
    next(error);
  }
});

export const campaignRouter = router;
