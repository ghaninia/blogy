import { AppError } from '../../../shared/http/response.js';

export function pageNotFound(): AppError {
  return new AppError(404, 'Page not found', 'NOT_FOUND');
}

export function slugExists(): AppError {
  return new AppError(409, 'Slug already exists', 'SLUG_EXISTS');
}
