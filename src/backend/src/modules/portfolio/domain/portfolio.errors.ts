import { AppError } from '../../../shared/http/response.js';

export function portfolioNotFound(): AppError {
  return new AppError(404, 'Portfolio not found', 'NOT_FOUND');
}

export function slugExists(): AppError {
  return new AppError(409, 'Slug already exists', 'SLUG_EXISTS');
}
