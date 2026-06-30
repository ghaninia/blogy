import { AppError } from '../../../shared/http/response.js';

export function categoryNotFound(): AppError {
  return new AppError(404, 'Category not found', 'NOT_FOUND');
}

export function slugExists(): AppError {
  return new AppError(409, 'Slug already exists', 'SLUG_EXISTS');
}
