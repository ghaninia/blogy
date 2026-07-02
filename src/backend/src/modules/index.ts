import { authModule } from './auth/auth.module.js';
import { postModule } from './post/post.module.js';
import { pageModule } from './page/page.module.js';
import { categoryModule } from './category/category.module.js';
import { tagModule } from './tag/tag.module.js';
import { portfolioModule } from './portfolio/portfolio.module.js';
import { mediaModule } from './media/media.module.js';
import { commentModule } from './comment/comment.module.js';
import { settingModule } from './setting/setting.module.js';
import { experienceModule } from './experience/experience.module.js';

export const modules = [
  authModule,
  postModule,
  pageModule,
  categoryModule,
  tagModule,
  portfolioModule,
  experienceModule,
  mediaModule,
  commentModule,
  settingModule,
];
