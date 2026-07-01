import path from 'path';
import { env } from '../config/env.js';
import { AppError } from '../http/response.js';

const FOLDER_PATTERN = /^[a-z0-9_-]{1,64}$/;

export function sanitizeUploadFolder(folder?: string | null): string {
  const value = (folder ?? 'general').trim().toLowerCase();
  if (!FOLDER_PATTERN.test(value)) {
    throw new AppError(400, 'Invalid folder name', 'INVALID_FOLDER');
  }
  return value;
}

export function resolveUploadPath(...segments: string[]): string {
  const base = path.resolve(env.uploadDir);
  const target = path.resolve(base, ...segments);
  if (target !== base && !target.startsWith(`${base}${path.sep}`)) {
    throw new AppError(400, 'Invalid upload path', 'INVALID_PATH');
  }
  return target;
}
