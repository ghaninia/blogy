import { AppError } from '../../../shared/http/response.js';

export function userExists(): AppError {
  return new AppError(409, 'Email or username already exists', 'USER_EXISTS');
}

export function invalidCredentials(): AppError {
  return new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
}

export function invalidRefreshToken(): AppError {
  return new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH');
}

export function refreshExpired(): AppError {
  return new AppError(401, 'Refresh token expired', 'REFRESH_EXPIRED');
}

export function userNotFound(): AppError {
  return new AppError(404, 'User not found', 'USER_NOT_FOUND');
}
