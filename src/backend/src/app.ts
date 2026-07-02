import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './shared/config/env.js';
import { globalRateLimiter } from './shared/security/rate-limit.js';
import { errorHandler, notFoundHandler } from './shared/http/error-handler.js';
import { modules } from './modules/index.js';
import { mediaService } from './modules/media/application/media.service.js';

export async function createApp(): Promise<Express> {
  const app = express();

  app.set('trust proxy', 1);

  await mediaService.ensureUploadDir();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use(globalRateLimiter);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/uploads', express.static(path.resolve(env.uploadDir)));

  for (const module of modules) {
    app.use(module.path, module.router);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
