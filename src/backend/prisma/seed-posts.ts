export interface SeedPost {
  slug: string;
  titleFa: string;
  titleEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa: string;
  contentEn: string;
  publishedAt: Date;
  tagSlug?: string;
}

function p(text: string) {
  return `<p>${text}</p>`;
}

function h2(text: string) {
  return `<h2>${text}</h2>`;
}

function h3(text: string) {
  return `<h3>${text}</h3>`;
}

function ul(items: string[]) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function code(text: string) {
  return `<pre><code>${text}</code></pre>`;
}

export const seedPosts: SeedPost[] = [
  {
    slug: 'react-server-components-guide',
    titleFa: 'راهنمای جامع React Server Components',
    titleEn: 'A Complete Guide to React Server Components',
    excerptFa:
      'Server Components نحوه ساخت رابط کاربری در React را متحول کرده‌اند. در این مقاله معماری، مزایا و الگوهای عملی را بررسی می‌کنیم.',
    excerptEn:
      'Server Components have changed how we build React UIs. This article explores architecture, benefits, and practical patterns.',
    publishedAt: new Date('2025-01-15'),
    tagSlug: 'react',
    contentFa: [
      h2('Server Components چیست؟'),
      p(
        'React Server Components (RSC) به شما اجازه می‌دهند کامپوننت‌هایی بنویسید که فقط روی سرور رندر می‌شوند و هیچ JavaScript اضافه‌ای به باندل کلاینت ارسال نمی‌کنند. این یعنی دسترسی مستقیم به دیتابیس، فایل‌سیستم و سرویس‌های داخلی بدون API میانی.',
      ),
      p(
        'در معماری مدرن Next.js App Router، به‌طور پیش‌فرض همه کامپوننت‌ها Server Component هستند مگر اینکه فایل با «use client» علامت‌گذاری شده باشد. این تفکیم مرز بین لایه داده و لایه تعامل را شفاف می‌کند.',
      ),
      h2('مزایای کلیدی'),
      ul([
        'کاهش چشمگیر حجم JavaScript ارسالی به مرورگر',
        'بهبود زمان First Contentful Paint و LCP',
        'امنیت بیشتر چون توکن‌ها و کوئری‌های حساس روی سرور می‌مانند',
        'کش‌کردن طبیعی نتایج fetch در لایه سرور',
      ]),
      h3('الگوی ترکیب با Client Components'),
      p(
        'بهترین رویکرد این است که Server Component داده را بخواند و به Client Component تعاملی پاس دهد. مثلاً لیست پست‌ها روی سرور fetch می‌شود و دکمه لایک در کلاینت مدیریت می‌شود.',
      ),
      code(`// app/posts/page.tsx — Server Component\nconst posts = await db.post.findMany();\nreturn <PostList posts={posts} />;`),
      h2('اشتباهات رایج'),
      p(
        'یکی از خطاهای پرتکرار، استفاده از useState یا useEffect داخل Server Component است. اگر به state یا event handler نیاز دارید، آن بخش را به فایل جدا با «use client» منتقل کنید.',
      ),
      p(
        'همچنین مراقب باشید props ارسالی از سرور به کلاینت باید Serializable باشند؛ یعنی نمی‌توانید تابع یا کلاس Prisma را مستقیم پاس دهید.',
      ),
    ].join(''),
    contentEn: [
      h2('What Are Server Components?'),
      p(
        'React Server Components (RSC) let you write components that render only on the server and send zero extra JavaScript to the client bundle. That means direct database access, filesystem reads, and internal services without a middle API layer.',
      ),
      p(
        'In the modern Next.js App Router, every component is a Server Component by default unless the file is marked with "use client". This makes the boundary between data and interaction explicit.',
      ),
      h2('Key Benefits'),
      ul([
        'Dramatically smaller JavaScript payloads',
        'Better First Contentful Paint and LCP scores',
        'Improved security because secrets stay on the server',
        'Natural caching of fetch results at the server layer',
      ]),
      h3('Composition Pattern'),
      p(
        'The best approach is to fetch in Server Components and pass data into interactive Client Components. For example, load posts on the server and keep the like button on the client.',
      ),
      code(`// app/posts/page.tsx — Server Component\nconst posts = await db.post.findMany();\nreturn <PostList posts={posts} />;`),
      h2('Common Mistakes'),
      p(
        'A frequent error is calling useState or useEffect inside a Server Component. Move interactive parts into a separate "use client" file.',
      ),
      p(
        'Also remember that props passed from server to client must be serializable—you cannot pass functions or Prisma model instances directly.',
      ),
    ].join(''),
  },
  {
    slug: 'typescript-advanced-types',
    titleFa: 'انواع پیشرفته TypeScript برای توسعه‌دهندگان حرفه‌ای',
    titleEn: 'Advanced TypeScript Types for Professional Developers',
    excerptFa:
      'Generics، Conditional Types و Mapped Types ابزارهایی هستند که TypeScript را از یک type checker ساده به یک زبان مدل‌سازی قدرتمند تبدیل می‌کنند.',
    excerptEn:
      'Generics, conditional types, and mapped types turn TypeScript from a simple checker into a powerful modeling language.',
    publishedAt: new Date('2025-01-22'),
    tagSlug: 'typescript',
    contentFa: [
      h2('Generics در عمل'),
      p(
        'Genericها به شما اجازه می‌دهند تابع یا اینترفیس‌هایی بنویسید که با انواع مختلف کار کنند بدون از دست دادن type safety. در پروژه‌های بزرگ، این الگو اساس repository و API client است.',
      ),
      code('function wrap<T>(value: T): { data: T } {\n  return { data: value };\n}'),
      h2('Conditional Types'),
      p(
        'Conditional Types با سینتکس T extends U ? X : Y به شما اجازه می‌دهند نوع خروجی را بر اساس ورودی محاسبه کنید. این تکنیک در کتابخانه‌هایی مثل React Query و tRPC بسیار رایج است.',
      ),
      h3('Mapped Types'),
      p(
        'با Mapped Types می‌توانید نوع جدیدی از روی نوع موجود بسازید؛ مثلاً همه فیلدهای یک interface را optional یا readonly کنید.',
      ),
      code('type PartialPost = Partial<Post>;\ntype ReadonlyPost = Readonly<Post>;'),
      h2('نتیجه‌گیری'),
      p(
        'تسلط بر انواع پیشرفته TypeScript زمان refactor را کم می‌کند و باگ‌های runtime زیادی را قبل از deploy می‌گیرد. سرمایه‌گذاری روی type layer در پروژه‌های تیمی اجتناب‌ناپذیر است.',
      ),
    ].join(''),
    contentEn: [
      h2('Generics in Practice'),
      p(
        'Generics let you write functions and interfaces that work across types without losing safety. In large codebases this pattern is the foundation of repositories and API clients.',
      ),
      code('function wrap<T>(value: T): { data: T } {\n  return { data: value };\n}'),
      h2('Conditional Types'),
      p(
        'Conditional types use the syntax T extends U ? X : Y to compute output types from inputs. You will see this everywhere in libraries like React Query and tRPC.',
      ),
      h3('Mapped Types'),
      p(
        'Mapped types derive new shapes from existing ones—for example making every field optional or readonly.',
      ),
      code('type PartialPost = Partial<Post>;\ntype ReadonlyPost = Readonly<Post>;'),
      h2('Conclusion'),
      p(
        'Mastering advanced TypeScript types reduces refactor time and catches runtime bugs before deploy. Investing in your type layer is essential for team projects.',
      ),
    ].join(''),
  },
  {
    slug: 'nextjs-app-router-deep-dive',
    titleFa: 'Next.js App Router: بررسی عمیق routing و data fetching',
    titleEn: 'Next.js App Router: Deep Dive into Routing and Data Fetching',
    excerptFa:
      'App Router فقط یک تغییر پوشه نیست؛ مدل ذهنی جدیدی برای layout، loading، error boundary و streaming ارائه می‌دهد.',
    excerptEn:
      'The App Router is not just a folder change—it introduces a new mental model for layouts, loading, errors, and streaming.',
    publishedAt: new Date('2025-02-01'),
    tagSlug: 'nextjs',
    contentFa: [
      h2('ساختار پوشه app'),
      p(
        'هر segment در مسیر app می‌تواند layout.tsx، page.tsx، loading.tsx و error.tsx داشته باشد. layoutها nested هستند و state آن‌ها بین navigation حفظ می‌شود.',
      ),
      h2('Data Fetching'),
      p(
        'در Server Component می‌توانید async/await مستقیم استفاده کنید. Next.js درخواست‌های fetch را به‌صورت خودکار dedupe و cache می‌کند مگر revalidate مشخص کنید.',
      ),
      ul([
        'fetch(url, { next: { revalidate: 60 } }) برای ISR',
        'export const dynamic = "force-dynamic" برای SSR کامل',
        'Suspense boundary برای streaming بخش‌های کند',
      ]),
      h2('Middleware و i18n'),
      p(
        'middleware.ts قبل از render اجرا می‌شود و برای redirect، auth و locale prefix ایده‌آل است. در پروژه‌های دوزبانه معمولاً locale را از segment اول URL می‌خوانند.',
      ),
    ].join(''),
    contentEn: [
      h2('The app Directory Structure'),
      p(
        'Each segment under app can define layout.tsx, page.tsx, loading.tsx, and error.tsx. Layouts nest and preserve state across navigations.',
      ),
      h2('Data Fetching'),
      p(
        'Server Components support async/await directly. Next.js deduplicates and caches fetch calls unless you opt out with revalidate settings.',
      ),
      ul([
        'fetch(url, { next: { revalidate: 60 } }) for ISR',
        'export const dynamic = "force-dynamic" for full SSR',
        'Suspense boundaries to stream slow sections',
      ]),
      h2('Middleware and i18n'),
      p(
        'middleware.ts runs before render and is ideal for redirects, auth, and locale prefixes. Bilingual apps usually read locale from the first URL segment.',
      ),
    ].join(''),
  },
  {
    slug: 'postgresql-indexing-strategies',
    titleFa: 'استراتژی‌های ایندکس‌گذاری PostgreSQL',
    titleEn: 'PostgreSQL Indexing Strategies That Actually Work',
    excerptFa:
      'ایندکس درست می‌تواند کوئری را از چند ثانیه به چند میلی‌ثانیه برساند. این مقاله B-Tree، GIN و composite index را با مثال واقعی توضیح می‌دهد.',
    excerptEn:
      'The right index can turn a multi-second query into milliseconds. This post explains B-Tree, GIN, and composite indexes with real examples.',
    publishedAt: new Date('2025-02-08'),
    tagSlug: 'database',
    contentFa: [
      h2('چه زمانی ایندکس بسازیم؟'),
      p(
        'ستون‌هایی که در WHERE، JOIN و ORDER BY زیاد استفاده می‌شوند کاندیدای خوبی هستند. قبل از افزودن ایندکس، EXPLAIN ANALYZE بگیرید تا bottleneck واقعی را ببینید.',
      ),
      h2('Composite Index'),
      p(
        'ترتیب ستون‌ها در composite index مهم است. اگر کوئری شما WHERE status = ? AND published_at DESC است، ایندکس (status, published_at) معمولاً بهتر از دو ایندکس جدا عمل می‌کند.',
      ),
      h3('GIN برای جستجوی متنی'),
      p(
        'برای full-text search یا JSONB در PostgreSQL از GIN index استفاده کنید. Prisma هنوز همه انواع index را در schema پشتیبانی نمی‌کند؛ گاهی migration خام SQL لازم است.',
      ),
      h2('هزینه نگهداری'),
      p(
        'هر ایندکس write را کندتر می‌کند. در جداول با insert سنگین، فقط ایندکس‌های ضروری نگه دارید و periodically با pg_stat_user_indexes استفاده را audit کنید.',
      ),
    ].join(''),
    contentEn: [
      h2('When to Add an Index'),
      p(
        'Columns used heavily in WHERE, JOIN, and ORDER BY are good candidates. Always run EXPLAIN ANALYZE before adding indexes to find the real bottleneck.',
      ),
      h2('Composite Indexes'),
      p(
        'Column order matters. For WHERE status = ? AND published_at DESC, an index on (status, published_at) often beats two separate indexes.',
      ),
      h3('GIN for Text Search'),
      p(
        'Use GIN indexes for full-text search or JSONB in PostgreSQL. Prisma does not expose every index type yet—sometimes you need raw SQL migrations.',
      ),
      h2('Maintenance Cost'),
      p(
        'Every index slows writes. On write-heavy tables keep only essential indexes and audit usage with pg_stat_user_indexes.',
      ),
    ].join(''),
  },
  {
    slug: 'docker-for-web-developers',
    titleFa: 'Docker برای توسعه‌دهندگان وب: از صفر تا production',
    titleEn: 'Docker for Web Developers: From Zero to Production',
    excerptFa:
      'Docker محیط dev و production را یکسان نگه می‌دارد. در این راهنما Dockerfile، compose و best practice برای Node.js را مرور می‌کنیم.',
    excerptEn:
      'Docker keeps dev and production environments aligned. This guide covers Dockerfiles, Compose, and Node.js best practices.',
    publishedAt: new Date('2025-02-14'),
    tagSlug: 'devops',
    contentFa: [
      h2('چرا Docker؟'),
      p(
        '«روی سیستم من کار می‌کرد» با container عملاً حذف می‌شود. تیم شما PostgreSQL، Redis و backend را با یک docker compose up بالا می‌آورد.',
      ),
      h2('Multi-stage Dockerfile'),
      p(
        'برای Node.js از multi-stage build استفاده کنید: stage اول dependencies و build، stage دوم فقط production node_modules و dist. حجم image به‌شدت کم می‌شود.',
      ),
      code('FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/index.js"]'),
      h2('Volume و hot reload'),
      p(
        'در development سورس را mount کنید و node_modules را در named volume نگه دارید تا install روی macOS/Windows کند نشود.',
      ),
    ].join(''),
    contentEn: [
      h2('Why Docker?'),
      p(
        '"Works on my machine" disappears with containers. Your team can boot PostgreSQL, Redis, and the API with a single docker compose up.',
      ),
      h2('Multi-stage Dockerfile'),
      p(
        'For Node.js use multi-stage builds: one stage for dependencies and build, another with only production artifacts. Image size drops dramatically.',
      ),
      code('FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/index.js"]'),
      h2('Volumes and Hot Reload'),
      p(
        'In development mount source code and keep node_modules in a named volume so installs stay fast on macOS and Windows.',
      ),
    ].join(''),
  },
  {
    slug: 'css-grid-modern-layouts',
    titleFa: 'CSS Grid: ساخت layoutهای مدرن بدون framework',
    titleEn: 'CSS Grid: Modern Layouts Without a Framework',
    excerptFa:
      'Grid و Flexbox هر کدام جای خود را دارند. یاد بگیرید چطور dashboard، gallery و landing page را فقط با CSS native بسازید.',
    excerptEn:
      'Grid and Flexbox each have their place. Learn to build dashboards, galleries, and landing pages with native CSS alone.',
    publishedAt: new Date('2025-02-20'),
    tagSlug: 'css',
    contentFa: [
      h2('Grid vs Flexbox'),
      p(
        'Flexbox برای محور یک‌بعدی (ردیف یا ستون) عالی است. Grid برای layout دو‌بعدی طراحی شده—مثلاً sidebar ثابت + content + footer.',
      ),
      code('.layout {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100dvh;\n}'),
      h2('responsive بدون media query زیاد'),
      p(
        'با auto-fit و minmax می‌توانید card grid responsive بسازید: grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).',
      ),
      h2('subgrid'),
      p(
        'CSS subgrid به cardهای nested اجازه می‌دهد با grid والد align شوند—برای blog card با title و excerpt ارتفاع یکسان بسیار مفید است.',
      ),
    ].join(''),
    contentEn: [
      h2('Grid vs Flexbox'),
      p(
        'Flexbox excels at one-dimensional flows. Grid is built for two-dimensional layouts—fixed sidebar, content, and footer regions.',
      ),
      code('.layout {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100dvh;\n}'),
      h2('Responsive Without Many Breakpoints'),
      p(
        'auto-fit with minmax builds responsive card grids: grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).',
      ),
      h2('Subgrid'),
      p(
        'CSS subgrid lets nested cards align with the parent grid—great for equal-height blog cards with titles and excerpts.',
      ),
    ].join(''),
  },
  {
    slug: 'git-workflow-for-teams',
    titleFa: 'Git workflow حرفه‌ای برای تیم‌های نرم‌افزاری',
    titleEn: 'Professional Git Workflow for Software Teams',
    excerptFa:
      'Trunk-based development، feature branch و conventional commits—کدام برای تیم شما مناسب‌تر است؟',
    excerptEn:
      'Trunk-based development, feature branches, and conventional commits—which fits your team best?',
    publishedAt: new Date('2025-03-01'),
    tagSlug: 'git',
    contentFa: [
      h2('Feature Branch'),
      p(
        'هر task یک branch از main: feature/add-login. PR کوچک review سریع‌تر و conflict کمتر دارد. branch عمر کوتاه (۱–۳ روز) ideal است.',
      ),
      h2('Conventional Commits'),
      p(
        'فرمت type(scope): message به changelog خودکار و semantic versioning کمک می‌کند. مثال: feat(auth): add OAuth2 Google provider.',
      ),
      h3('Rebase vs Merge'),
      p(
        'Rebase history را linear نگه می‌دارد؛ merge واقعیت تاریخچه را حفظ می‌کند. در تیم‌های بزرگ squash merge روی main رایج است.',
      ),
      h2('CI روی هر PR'),
      p(
        'lint، test و build باید قبل از merge سبز باشند. branch protection روی main از push مستقیم جلوگیری می‌کند.',
      ),
    ].join(''),
    contentEn: [
      h2('Feature Branches'),
      p(
        'One branch per task off main: feature/add-login. Small PRs review faster with fewer conflicts. Ideal branch lifetime is one to three days.',
      ),
      h2('Conventional Commits'),
      p(
        'The type(scope): message format powers automated changelogs and semantic versioning. Example: feat(auth): add OAuth2 Google provider.',
      ),
      h3('Rebase vs Merge'),
      p(
        'Rebase keeps history linear; merge preserves true history. Large teams often squash merge into main.',
      ),
      h2('CI on Every PR'),
      p(
        'Lint, test, and build must pass before merge. Branch protection blocks direct pushes to main.',
      ),
    ].join(''),
  },
  {
    slug: 'rest-api-design-principles',
    titleFa: 'اصول طراحی REST API مقیاس‌پذیر',
    titleEn: 'Principles of Scalable REST API Design',
    excerptFa:
      'Resource naming، pagination، versioning و error format—پایه‌های API که frontend و mobile هر دو دوست دارند.',
    excerptEn:
      'Resource naming, pagination, versioning, and error formats—the API foundations both web and mobile clients love.',
    publishedAt: new Date('2025-03-08'),
    tagSlug: 'api',
    contentFa: [
      h2('Resource-oriented URLs'),
      p(
        'از فعل در URL پرهیز کنید. GET /api/posts و POST /api/posts به‌جای /api/getPosts. nested resource فقط یک سطح: /posts/:id/comments.',
      ),
      h2('Pagination استاندارد'),
      p(
        'پاسخ لیست باید data + meta داشته باشد: page، limit، total، totalPages. cursor-based pagination برای feed بی‌نهایت بهتر از offset است.',
      ),
      code('{\n  "success": true,\n  "data": [...],\n  "meta": { "page": 1, "limit": 20, "total": 153 }\n}'),
      h2('Error handling'),
      p(
        'فرمت خطای یکسان: code، message، details. HTTP status معنادار: 422 برای validation، 409 برای conflict، 401/403 برای auth.',
      ),
    ].join(''),
    contentEn: [
      h2('Resource-oriented URLs'),
      p(
        'Avoid verbs in URLs. Use GET /api/posts and POST /api/posts instead of /api/getPosts. Keep nesting shallow: /posts/:id/comments.',
      ),
      h2('Standard Pagination'),
      p(
        'List responses should include data plus meta: page, limit, total, totalPages. Cursor pagination beats offset for infinite feeds.',
      ),
      code('{\n  "success": true,\n  "data": [...],\n  "meta": { "page": 1, "limit": 20, "total": 153 }\n}'),
      h2('Error Handling'),
      p(
        'Use a consistent error shape: code, message, details. Meaningful HTTP status: 422 validation, 409 conflict, 401/403 auth.',
      ),
    ].join(''),
  },
  {
    slug: 'prisma-orm-best-practices',
    titleFa: 'Prisma ORM: بهترین روش‌ها در پروژه production',
    titleEn: 'Prisma ORM: Best Practices for Production Projects',
    excerptFa:
      'Schema design، migration، relation و performance tuning با Prisma Client در stack Node.js.',
    excerptEn:
      'Schema design, migrations, relations, and performance tuning with Prisma Client in Node.js stacks.',
    publishedAt: new Date('2025-03-15'),
    tagSlug: 'database',
    contentFa: [
      h2('طراحی schema'),
      p(
        'روابط را explicit تعریف کنید و onDelete را عمداً انتخاب کنید. Cascade برای join table، SetNull برای optional foreign key مثل coverMedia.',
      ),
      h2('Migration workflow'),
      p(
        'در dev از migrate dev استفاده کنید؛ در CI/CD فقط migrate deploy. هرگز migration applied را دستی edit نکنید—migration جدید بسازید.',
      ),
      h3('N+1 problem'),
      p(
        'با include و select دقیق relationها را یک‌جا بگیرید. برای لیست سنگین raw query یا $queryRaw گاهی لازم است.',
      ),
      h2('Singleton Client'),
      p(
        'در development یک instance PrismaClient روی global نگه دارید تا hot reload connection exhausted نکند.',
      ),
    ].join(''),
    contentEn: [
      h2('Schema Design'),
      p(
        'Define relations explicitly and choose onDelete deliberately. Cascade for join tables, SetNull for optional foreign keys like coverMedia.',
      ),
      h2('Migration Workflow'),
      p(
        'Use migrate dev locally and migrate deploy in CI/CD. Never hand-edit applied migrations—create a new one instead.',
      ),
      h3('The N+1 Problem'),
      p(
        'Use include and select to fetch relations in one round trip. Heavy lists sometimes need raw queries or $queryRaw.',
      ),
      h2('Singleton Client'),
      p(
        'In development store one PrismaClient on global to survive hot reload without exhausting connections.',
      ),
    ].join(''),
  },
  {
    slug: 'testing-with-vitest',
    titleFa: 'تست واحد با Vitest در پروژه‌های TypeScript',
    titleEn: 'Unit Testing with Vitest in TypeScript Projects',
    excerptFa:
      'Vitest سریع، سازگار با Vite و با API شبیه Jest. راه‌اندازی، mock و تست async را یاد بگیرید.',
    excerptEn:
      'Vitest is fast, Vite-native, and Jest-compatible. Learn setup, mocking, and async testing patterns.',
    publishedAt: new Date('2025-03-22'),
    tagSlug: 'testing',
    contentFa: [
      h2('چرا Vitest؟'),
      p(
        'Vitest از ESM و TypeScript native پشتیبانی می‌کند و در monorepo با watch mode فوق‌سریع است. برای پروژه Next.js و Express هر دو مناسب است.',
      ),
      h2('ساختار تست'),
      p(
        'فایل‌های *.test.ts کنار سورس یا در __tests__. Arrange-Act-Assert را رعایت کنید؛ هر test یک رفتار را بررسی کند.',
      ),
      code("import { describe, it, expect } from 'vitest';\n\ndescribe('slugify', () => {\n  it('lowercases text', () => {\n    expect(slugify('Hello')).toBe('hello');\n  });\n});"),
      h2('Mock کردن dependency'),
      p(
        'vi.mock برای module-level mock و vi.spyOn برای partial mock. برای database در integration test از test container PostgreSQL استفاده کنید.',
      ),
    ].join(''),
    contentEn: [
      h2('Why Vitest?'),
      p(
        'Vitest supports ESM and TypeScript natively and is extremely fast in watch mode inside monorepos. It works for both Next.js and Express projects.',
      ),
      h2('Test Structure'),
      p(
        'Place *.test.ts files next to source or under __tests__. Follow Arrange-Act-Assert and test one behavior per case.',
      ),
      code("import { describe, it, expect } from 'vitest';\n\ndescribe('slugify', () => {\n  it('lowercases text', () => {\n    expect(slugify('Hello')).toBe('hello');\n  });\n});"),
      h2('Mocking Dependencies'),
      p(
        'Use vi.mock for module mocks and vi.spyOn for partial mocks. For integration tests spin up a PostgreSQL test container.',
      ),
    ].join(''),
  },
  {
    slug: 'web-performance-core-vitals',
    titleFa: 'بهینه‌سازی Core Web Vitals در اپلیکیشن‌های React',
    titleEn: 'Optimizing Core Web Vitals in React Applications',
    excerptFa:
      'LCP، INP و CLS مستقیماً روی SEO و conversion اثر دارند. تکنیک‌های عملی برای بهبود هر کدام.',
    excerptEn:
      'LCP, INP, and CLS directly affect SEO and conversion. Practical techniques to improve each metric.',
    publishedAt: new Date('2025-04-01'),
    tagSlug: 'performance',
    contentFa: [
      h2('Largest Contentful Paint'),
      p(
        'تصویر hero را priority load کنید، از next/image استفاده کنید و font را preload کنید. Server-side render محتوای above-the-fold LCP را بهبود می‌دهد.',
      ),
      h2('Interaction to Next Paint'),
      p(
        'کار سنگین JavaScript را به web worker یا idle callback منتقل کنید. bundle را با dynamic import بشکنید تا main thread آزاد بماند.',
      ),
      h2('Cumulative Layout Shift'),
      p(
        'همیشه width و height برای media مشخص کنید. placeholder برای font و skeleton برای async content از jump layout جلوگیری می‌کند.',
      ),
      ul([
        'از transform به‌جای تغییر width/height برای animation',
        'reserve فضا برای ad و embed',
        'avoid inserting content بالای محتوای موجود',
      ]),
    ].join(''),
    contentEn: [
      h2('Largest Contentful Paint'),
      p(
        'Priority-load hero images, use next/image, and preload fonts. Server-rendering above-the-fold content improves LCP.',
      ),
      h2('Interaction to Next Paint'),
      p(
        'Move heavy JavaScript to web workers or idle callbacks. Split bundles with dynamic imports to keep the main thread free.',
      ),
      h2('Cumulative Layout Shift'),
      p(
        'Always set width and height on media. Font placeholders and async skeletons prevent layout jumps.',
      ),
      ul([
        'Prefer transform over width/height animations',
        'Reserve space for ads and embeds',
        'Avoid inserting content above existing content',
      ]),
    ].join(''),
  },
  {
    slug: 'redis-caching-patterns',
    titleFa: 'الگوهای کش Redis در backend Node.js',
    titleEn: 'Redis Caching Patterns for Node.js Backends',
    excerptFa:
      'Cache-aside، write-through و TTL strategy—چطور بار دیتابیس را کم کنیم بدون داده stale خطرناک.',
    excerptEn:
      'Cache-aside, write-through, and TTL strategies—how to reduce database load without dangerous stale data.',
    publishedAt: new Date('2025-04-08'),
    tagSlug: 'backend',
    contentFa: [
      h2('Cache-Aside'),
      p(
        'اپلیکیشن اول Redis را چک می‌کند؛ miss که شد از DB می‌خواند و در cache می‌نویسد. ساده‌ترین الگو و برای read-heavy عالی است.',
      ),
      h2('TTL و invalidation'),
      p(
        'TTL کوتاه برای داده پرتغیر، TTL بلند برای تنظیمات سایت. روی write موفق، key مربوطه را delete کنید—cache invalidation سخت‌ترین مسئله علوم کامپیوتر!',
      ),
      h3('Key naming'),
      p(
        'prefix:module:id مثل post:slug:welcome. از SCAN به‌جای KEYS در production استفاده کنید.',
      ),
      h2('Redis برای session و rate limit'),
      p(
        'علاوه بر cache، Redis برای session store و sliding window rate limit در API gateway بسیار رایج است.',
      ),
    ].join(''),
    contentEn: [
      h2('Cache-Aside'),
      p(
        'The app checks Redis first; on miss it reads the DB and writes cache. Simplest pattern and great for read-heavy workloads.',
      ),
      h2('TTL and Invalidation'),
      p(
        'Short TTL for volatile data, long TTL for site settings. Delete related keys on successful writes—cache invalidation strikes again!',
      ),
      h3('Key Naming'),
      p(
        'Use prefix:module:id like post:slug:welcome. Prefer SCAN over KEYS in production.',
      ),
      h2('Sessions and Rate Limiting'),
      p(
        'Beyond caching, Redis powers session stores and sliding-window rate limits at the API gateway.',
      ),
    ].join(''),
  },
  {
    slug: 'pnpm-monorepo-guide',
    titleFa: 'Monorepo با pnpm workspace: راهنمای عملی',
    titleEn: 'pnpm Workspaces Monorepo: A Practical Guide',
    excerptFa:
      'چند package در یک repo—backend، dashboard و client—با share dependency و script یکپارچه.',
    excerptEn:
      'Multiple packages in one repo—backend, dashboard, and client—with shared dependencies and unified scripts.',
    publishedAt: new Date('2025-04-15'),
    tagSlug: 'devops',
    contentFa: [
      h2('ساختار workspace'),
      p(
        'pnpm-workspace.yaml مسیر packageها را تعریف می‌کند. dependency داخلی با workspace:* لینk می‌شود بدون publish npm.',
      ),
      code('packages:\n  - "src/backend"\n  - "src/dashboard"\n  - "src/client"'),
      h2('فیلتر و parallel dev'),
      p(
        'pnpm --filter @gh/backend dev فقط backend را اجرا می‌کند. --parallel برای چند سرویس همزمان در development.',
      ),
      h2('shared types'),
      p(
        'types مشترک API را در package @gh/backend export کنید تا dashboard و client type-safe بمانند.',
      ),
    ].join(''),
    contentEn: [
      h2('Workspace Structure'),
      p(
        'pnpm-workspace.yaml declares package paths. Internal deps link with workspace:* without publishing to npm.',
      ),
      code('packages:\n  - "src/backend"\n  - "src/dashboard"\n  - "src/client"'),
      h2('Filters and Parallel Dev'),
      p(
        'pnpm --filter @gh/backend dev runs only backend. --parallel starts multiple services during development.',
      ),
      h2('Shared Types'),
      p(
        'Export shared API types from @gh/backend so dashboard and client stay type-safe.',
      ),
    ].join(''),
  },
  {
    slug: 'web-accessibility-a11y',
    titleFa: 'دسترسی‌پذیری وب (a11y): چک‌لیست توسعه‌دهنده',
    titleEn: 'Web Accessibility (a11y): Developer Checklist',
    excerptFa:
      'semantic HTML، keyboard navigation، ARIA و contrast—استانداردهایی که UX همه کاربران را بهتر می‌کند.',
    excerptEn:
      'Semantic HTML, keyboard navigation, ARIA, and contrast—standards that improve UX for everyone.',
    publishedAt: new Date('2025-04-22'),
    tagSlug: 'frontend',
    contentFa: [
      h2('Semantic HTML'),
      p(
        'از button برای action و a برای navigation استفاده کنید. div onClick anti-pattern است مگر role و keyboard handler اضافه کنید.',
      ),
      h2('Keyboard'),
      p(
        'همه interactive element باید با Tab قابل focus باشند. focus ring را با CSS حذف نکنید—با :focus-visible style دهید.',
      ),
      h3('ARIA فقط وقتی لازم است'),
      p(
        'ARIA مکمل semantic HTML است نه جایگزین. aria-label برای icon button، aria-live برای toast dynamic.',
      ),
      h2('Contrast و RTL'),
      p(
        'نسبت contrast متن 4.5:1 برای body. در RTL از logical properties (margin-inline-start) استفاده کنید نه left/right سخت.',
      ),
    ].join(''),
    contentEn: [
      h2('Semantic HTML'),
      p(
        'Use button for actions and anchor for navigation. div onClick is an anti-pattern unless you add role and keyboard handlers.',
      ),
      h2('Keyboard'),
      p(
        'Every interactive element must be focusable via Tab. Do not remove focus rings—style them with :focus-visible.',
      ),
      h3('ARIA When Needed'),
      p(
        'ARIA complements semantic HTML; it does not replace it. aria-label for icon buttons, aria-live for dynamic toasts.',
      ),
      h2('Contrast and RTL'),
      p(
        'Body text needs 4.5:1 contrast. In RTL prefer logical properties (margin-inline-start) over hard-coded left/right.',
      ),
    ].join(''),
  },
  {
    slug: 'graphql-vs-rest-2025',
    titleFa: 'GraphQL در برابر REST: کدام را در 2025 انتخاب کنیم؟',
    titleEn: 'GraphQL vs REST: Which to Choose in 2025?',
    excerptFa:
      'over-fetching، schema strongly typed و tooling—مقایسه صادقانه دو رویکرد برای API محصول.',
    excerptEn:
      'Over-fetching, strongly typed schemas, and tooling—a honest comparison for product APIs.',
    publishedAt: new Date('2025-05-01'),
    tagSlug: 'api',
    contentFa: [
      h2('REST همچنان قوی است'),
      p(
        'برای CRUD ساده، cache HTTP و tooling گسترده، REST هنوز default خوبی است. تیم‌های کوچک سریع‌تر ship می‌کنند.',
      ),
      h2('GraphQL کجا می‌درخشد'),
      p(
        'کلاینت‌های متنوع (web + mobile) با نیاز field متفاوت، dashboard پیچیده و aggregate چند resource—GraphQL over-fetching را حل می‌کند.',
      ),
      ul([
        'Schema واحد برای documentation',
        'Resolver composition برای backend modular',
        'هزینه: complexity caching و N+1 در resolver',
      ]),
      h2('راه میانه'),
      p(
        'بسیاری REST برای public API و GraphQL داخلی برای app frontend ترکیب می‌کنند. tRPC برای full-stack TypeScript گزینه سوم است.',
      ),
    ].join(''),
    contentEn: [
      h2('REST Is Still Strong'),
      p(
        'For simple CRUD, HTTP caching, and mature tooling, REST remains a great default. Small teams ship faster with it.',
      ),
      h2('Where GraphQL Shines'),
      p(
        'Multiple clients with different field needs, complex dashboards, and aggregating resources—GraphQL solves over-fetching.',
      ),
      ul([
        'Single schema for documentation',
        'Resolver composition for modular backends',
        'Cost: caching complexity and resolver N+1',
      ]),
      h2('The Middle Path'),
      p(
        'Many teams combine REST for public APIs with internal GraphQL for app frontends. tRPC is a third option for full-stack TypeScript.',
      ),
    ].join(''),
  },
];

export const seedTags = [
  { slug: 'react', nameFa: 'React', nameEn: 'React' },
  { slug: 'typescript', nameFa: 'TypeScript', nameEn: 'TypeScript' },
  { slug: 'nextjs', nameFa: 'Next.js', nameEn: 'Next.js' },
  { slug: 'database', nameFa: 'دیتابیس', nameEn: 'Database' },
  { slug: 'devops', nameFa: 'DevOps', nameEn: 'DevOps' },
  { slug: 'css', nameFa: 'CSS', nameEn: 'CSS' },
  { slug: 'git', nameFa: 'Git', nameEn: 'Git' },
  { slug: 'api', nameFa: 'API', nameEn: 'API' },
  { slug: 'testing', nameFa: 'Testing', nameEn: 'Testing' },
  { slug: 'performance', nameFa: 'Performance', nameEn: 'Performance' },
  { slug: 'backend', nameFa: 'Backend', nameEn: 'Backend' },
  { slug: 'frontend', nameFa: 'Frontend', nameEn: 'Frontend' },
];
