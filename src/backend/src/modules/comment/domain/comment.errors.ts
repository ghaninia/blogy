import { AppError } from '../../../shared/http/response.js';

export function commentNotFound(): AppError {
  return new AppError(404, 'Comment not found', 'NOT_FOUND');
}

export function postNotFound(): AppError {
  return new AppError(404, 'Post not found', 'NOT_FOUND');
}

export function invalidParent(): AppError {
  return new AppError(400, 'Invalid parent comment', 'INVALID_PARENT');
}

export function commentsDisabled(): AppError {
  return new AppError(403, 'Comments are disabled for this post', 'COMMENTS_DISABLED');
}
