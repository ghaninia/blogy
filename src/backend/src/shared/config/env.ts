import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function resolveUploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? '../../uploads';
  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  corsOrigin: requireEnv('CORS_ORIGIN', 'http://localhost:3000'),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-min-32-characters-long'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-min-32-characters-long'),
  jwtAccessExpires: requireEnv('JWT_ACCESS_EXPIRES', '15m'),
  jwtRefreshExpires: requireEnv('JWT_REFRESH_EXPIRES', '7d'),
  recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY ?? '',
  uploadDir: resolveUploadDir(),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? '10', 10),
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
};
