import type { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

function skipRateLimit(req: Request): boolean {
  if (env.isDev) return true;
  if (req.path === '/health') return true;
  if (req.path.startsWith('/uploads')) return true;
  return false;
}

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  message: { success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } },
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isDev,
  message: { success: false, error: { message: 'Too many auth attempts', code: 'AUTH_RATE_LIMIT' } },
});

export const commentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isDev,
  message: { success: false, error: { message: 'Too many comments', code: 'COMMENT_RATE_LIMIT' } },
});
