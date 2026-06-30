import { Router } from 'express';
import { Role } from '../../../db/index.js';
import { updateSettingSchema } from '../../../types/index.js';
import { settingService } from '../application/setting.service.js';
import { authenticate, authorize } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';

const router: Router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const settings = await settingService.list();
    sendSuccess(res, settings);
  } catch (e) {
    next(e);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const setting = await settingService.getByKey(paramId(req.params.key));
    sendSuccess(res, setting);
  } catch (e) {
    next(e);
  }
});

router.put(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateSettingSchema),
  async (req, res, next) => {
    try {
      const setting = await settingService.upsert(req.body);
      sendSuccess(res, setting);
    } catch (e) {
      next(e);
    }
  },
);

export const settingRouter = router;
