import type { ApiResponse } from '../../types/index.js';
import type { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: ApiResponse['meta'],
): void {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  code?: string,
  details?: unknown,
): void {
  const body: ApiResponse = {
    success: false,
    error: { message, code, details },
  };
  res.status(status).json(body);
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function getLocalizedField<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: 'fa' | 'en',
): string {
  const faKey = `${field}Fa`;
  const enKey = `${field}En`;
  const faVal = item[faKey] as string | undefined;
  const enVal = item[enKey] as string | undefined;
  if (locale === 'fa') return faVal ?? enVal ?? '';
  return enVal ?? faVal ?? '';
}
