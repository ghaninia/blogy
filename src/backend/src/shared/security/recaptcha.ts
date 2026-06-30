import { env } from '../config/env.js';
import { AppError } from '../http/response.js';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string, minScore = 0.5): Promise<void> {
  if (env.isDev && !env.recaptchaSecret) {
    return;
  }

  if (!env.recaptchaSecret) {
    throw new AppError(500, 'reCAPTCHA not configured', 'RECAPTCHA_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    secret: env.recaptchaSecret,
    response: token,
  });

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = (await response.json()) as RecaptchaResponse;

  if (!data.success) {
    throw new AppError(400, 'reCAPTCHA verification failed', 'RECAPTCHA_FAILED', data['error-codes']);
  }

  if (data.score !== undefined && data.score < minScore) {
    throw new AppError(400, 'reCAPTCHA score too low', 'RECAPTCHA_LOW_SCORE');
  }
}
