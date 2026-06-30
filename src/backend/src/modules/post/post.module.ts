import { postRouter } from './interface/post.controller.js';

export const postModule = {
  path: '/api/posts',
  router: postRouter,
};
