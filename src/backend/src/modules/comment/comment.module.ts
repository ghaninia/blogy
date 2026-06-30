import { commentRouter } from './interface/comment.controller.js';

export const commentModule = {
  path: '/api/comments',
  router: commentRouter,
};
