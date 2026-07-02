import { AppError } from '../../../shared/http/response.js';

export function experienceNotFound(): AppError {
  return new AppError(404, 'Experience not found', 'NOT_FOUND');
}
