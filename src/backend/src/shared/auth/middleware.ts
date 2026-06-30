import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../../db/index.js';
import { verifyAccessToken } from './jwt.js';
import { AppError } from '../http/response.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role as Role };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken;

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role as Role };
    }
    next();
  } catch {
    next();
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
      return;
    }
    next();
  };
}

export function authorizeOwnerOrRole(getOwnerId: (req: AuthRequest) => Promise<string | null>, ...roles: Role[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
      return;
    }
    if (roles.includes(req.user.role)) {
      next();
      return;
    }
    const ownerId = await getOwnerId(req);
    if (ownerId === req.user.id) {
      next();
      return;
    }
    next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
  };
}
