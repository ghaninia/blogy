import { Router } from 'express';
import { registerSchema, loginSchema, updateProfileSchema, updateUserRoleSchema } from '../../../types/index.js';
import { Role } from '../../../db/index.js';
import { authService } from '../application/auth.service.js';
import { authenticate, authorize, type AuthRequest } from '../../../shared/auth/middleware.js';
import { validate } from '../../../shared/http/validate.js';
import { authRateLimiter } from '../../../shared/security/rate-limit.js';
import { sendSuccess } from '../../../shared/http/response.js';
import { paramId } from '../../../shared/http/params.js';

const router: Router = Router();

function setAuthCookies(res: import('express').Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
}

router.post('/register', authRateLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const session = await authService.register(req.body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    sendSuccess(res, { user: session.user }, 201);
  } catch (e) {
    next(e);
  }
});

router.post('/login', authRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const session = await authService.login(req.body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    sendSuccess(res, { user: session.user });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = (req.cookies?.refreshToken as string) ?? req.body.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: { message: 'No refresh token' } });
      return;
    }
    const session = await authService.refresh(refreshToken);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    sendSuccess(res, { user: session.user });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await authService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    sendSuccess(res, { loggedOut: true });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (e) {
    next(e);
  }
});

router.patch('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user);
  } catch (e) {
    next(e);
  }
});

router.get('/users', authenticate, authorize(Role.ADMIN), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await authService.listUsers(page, limit);
    sendSuccess(res, result.items, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (e) {
    next(e);
  }
});

router.patch(
  '/users/:id/role',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateUserRoleSchema),
  async (req, res, next) => {
    try {
      const user = await authService.updateUserRole(paramId(req.params.id), req.body.role);
      sendSuccess(res, user);
    } catch (e) {
      next(e);
    }
  },
);

export const authRouter = router;
