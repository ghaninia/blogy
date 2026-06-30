import { Router } from 'express';
import multer from 'multer';
import { Role } from '../../../db/index.js';
import { mediaQuerySchema, updateMediaSchema } from '../../../types/index.js';
import { mediaService } from '../application/media.service.js';
import { authenticate, authorize, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { env } from '../../../shared/config/env.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/|video\/|application\/pdf)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

router.get('/', validate(mediaQuerySchema, 'query'), async (req, res, next) => {
  try {
    const result = await mediaService.list(req.query as never);
    const items = result.items.map((m) => ({
      ...m,
      url: mediaService.getPublicUrl(m.path),
    }));
    sendSuccess(res, items, 200, {
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
    const media = await mediaService.getById(paramId(req.params.id));
    sendSuccess(res, { ...media, url: mediaService.getPublicUrl(media.path) });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/upload',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR, Role.AUTHOR),
  upload.single('file'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        return;
      }
      const folder = (req.body.folder as string) || 'general';
      const media = await mediaService.upload(req.file, folder, req.user!.id);
      sendSuccess(res, { ...media, url: mediaService.getPublicUrl(media.path) }, 201);
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
      const result = await mediaService.delete(paramId(req.params.id));
      sendSuccess(res, result);
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  validate(updateMediaSchema),
  async (req, res, next) => {
    try {
      const media = await mediaService.update(paramId(req.params.id), req.body);
      sendSuccess(res, { ...media, url: mediaService.getPublicUrl(media.path) });
    } catch (e) {
      next(e);
    }
  },
);

export const mediaRouter = router;
