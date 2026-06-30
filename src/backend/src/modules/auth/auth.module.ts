import { authRouter } from './interface/auth.controller.js';

export const authModule = {
  path: '/api/auth',
  router: authRouter,
};
