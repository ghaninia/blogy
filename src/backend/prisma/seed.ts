import { PrismaClient, Role, PostStatus, PageType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await argon2.hash('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      passwordHash: adminPassword,
      displayName: 'Administrator',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      displayName: 'Administrator',
      role: Role.ADMIN,
    },
  });

  const editorPassword = await argon2.hash('Editor@123456');
  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {
      username: 'editor',
      passwordHash: editorPassword,
      displayName: 'Content Editor',
      role: Role.EDITOR,
    },
    create: {
      email: 'editor@example.com',
      username: 'editor',
      passwordHash: editorPassword,
      displayName: 'Content Editor',
      role: Role.EDITOR,
    },
  });

  const authorPassword = await argon2.hash('Author@123456');
  const author = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: {
      username: 'author',
      passwordHash: authorPassword,
      displayName: 'Blog Author',
      role: Role.AUTHOR,
    },
    create: {
      email: 'author@example.com',
      username: 'author',
      passwordHash: authorPassword,
      displayName: 'Blog Author',
      role: Role.AUTHOR,
    },
  });

  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      slug: 'technology',
      nameFa: 'فناوری',
      nameEn: 'Technology',
      descriptionFa: 'مقالات فناوری',
      descriptionEn: 'Technology articles',
    },
  });

  const nextjsTag = await prisma.tag.upsert({
    where: { slug: 'nextjs' },
    update: {},
    create: { slug: 'nextjs', nameFa: 'Next.js', nameEn: 'Next.js' },
  });

  await prisma.post.upsert({
    where: { slug: 'welcome-to-blogy' },
    update: {},
    create: {
      slug: 'welcome-to-blogy',
      titleFa: 'به Blogy خوش آمدید',
      titleEn: 'Welcome to Blogy',
      excerptFa: 'اولین پست وبلاگ حرفه‌ای دوزبانه',
      excerptEn: 'First post of our professional bilingual blog',
      contentFa: '<p>این یک پست نمونه به زبان فارسی است.</p>',
      contentEn: '<p>This is a sample post in English.</p>',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: author.id,
      categories: { create: [{ categoryId: techCategory.id }] },
      tags: { create: [{ tagId: nextjsTag.id }] },
    },
  });

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      type: PageType.ABOUT,
      titleFa: 'درباره ما',
      titleEn: 'About Us',
      contentFa: '<p>ما یک تیم توسعه‌دهنده هستیم.</p>',
      contentEn: '<p>We are a development team.</p>',
      isPublished: true,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      slug: 'contact',
      type: PageType.CONTACT,
      titleFa: 'تماس با ما',
      titleEn: 'Contact Us',
      contentFa: '<p>ایمیل: info@example.com</p>',
      contentEn: '<p>Email: info@example.com</p>',
      isPublished: true,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'resume' },
    update: {},
    create: {
      slug: 'resume',
      type: PageType.RESUME,
      titleFa: 'رزومه',
      titleEn: 'Resume',
      contentFa: '<p>رزومه حرفه‌ای</p>',
      contentEn: '<p>Professional resume</p>',
      isPublished: true,
    },
  });

  const defaultSettings = [
    {
      key: 'site_name',
      valueFa: 'Blogy',
      valueEn: 'Blogy',
    },
    {
      key: 'site_tagline',
      valueFa: 'تمرکز بر ساخت تجربه‌های وب شهودی و پرفورمنس. پل زدن بین طراحی و توسعه.',
      valueEn: 'Focused on creating intuitive and performant web experiences. Bridging the gap between design and development.',
    },
    {
      key: 'meta_title',
      valueFa: 'Blogy | وبلاگ حرفه‌ای',
      valueEn: 'Blogy | Professional Blog',
    },
    {
      key: 'meta_description',
      valueFa: 'وبلاگ حرفه‌ای دوزبانه با محتوای فارسی و انگلیسی',
      valueEn: 'A professional bilingual blog with Persian and English content',
    },
    {
      key: 'robots',
      valueEn: 'index, follow',
    },
    {
      key: 'contact_email',
      valueEn: 'hello@example.com',
    },
    {
      key: 'twitter_handle',
      valueEn: 'yourhandle',
    },
    {
      key: 'github_url',
      valueEn: 'https://github.com',
    },
    {
      key: 'linkedin_url',
      valueEn: 'https://linkedin.com',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  const experiences = [
    {
      titleFa: 'مدیرعامل',
      titleEn: 'CEO',
      companyFa: 'استودیو Reglazed',
      companyEn: 'Reglazed Studio',
      startDate: new Date('2024-01-01'),
      endDate: null,
      isPublished: true,
      sortOrder: 0,
    },
    {
      titleFa: 'مهندس طراحی',
      titleEn: 'Design Engineer',
      companyFa: 'فریلنس',
      companyEn: 'Freelance',
      startDate: new Date('2022-01-01'),
      endDate: null,
      isPublished: true,
      sortOrder: 1,
    },
    {
      titleFa: 'توسعه‌دهنده فرانت‌اند',
      titleEn: 'Front-end Developer',
      companyFa: 'فریلنس',
      companyEn: 'Freelance',
      startDate: new Date('2017-01-01'),
      endDate: null,
      isPublished: true,
      sortOrder: 2,
    },
  ];

  for (const exp of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { titleEn: exp.titleEn, companyEn: exp.companyEn },
    });
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data: exp });
    } else {
      await prisma.experience.create({ data: exp });
    }
  }

  console.log('Seed completed.');
  console.log('  Admin:  ', admin.email, '(Admin@123456)');
  console.log('  Editor: ', editor.email, '(Editor@123456)');
  console.log('  Author: ', author.email, '(Author@123456)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
