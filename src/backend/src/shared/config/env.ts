import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const INSECURE_JWT_SECRETS = new Set([
  'dev-access-secret-min-32-characters-long',
  'dev-refresh-secret-min-32-characters-long',
  'change-me-access-secret-min-32-chars',
  'change-me-refresh-secret-min-32-chars',
]);

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function resolveUploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? '../../uploads';
  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDev = nodeEnv === 'development';
const isProd = nodeEnv === 'production';

const jwtAccessSecret = requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-min-32-characters-long');
const jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-min-32-characters-long');
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY ?? '';

if (isProd) {
  if (INSECURE_JWT_SECRETS.has(jwtAccessSecret) || INSECURE_JWT_SECRETS.has(jwtRefreshSecret)) {
    throw new Error('JWT secrets must be set to strong unique values in production');
  }
  if (!recaptchaSecret) {
    throw new Error('RECAPTCHA_SECRET_KEY is required in production');
  }
}

export const env = {
  nodeEnv,
  isDev,
  isProd,
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  corsOrigin: requireEnv('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpires: requireEnv('JWT_ACCESS_EXPIRES', '15m'),
  jwtRefreshExpires: requireEnv('JWT_REFRESH_EXPIRES', '7d'),
  recaptchaSecret,
  uploadDir: resolveUploadDir(),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? (isDev ? '10000' : '500'), 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? (isDev ? '1000' : '10'), 10),
};
