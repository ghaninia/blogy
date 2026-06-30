import { AppError } from '../../../shared/http/response.js';

export function mediaNotFound(): AppError {
  return new AppError(404, 'Media not found', 'NOT_FOUND');
}
