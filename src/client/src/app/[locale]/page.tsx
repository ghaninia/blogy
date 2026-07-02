import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { IntroSection } from '@/components/home/intro-section';
import { ProjectsSection } from '@/components/home/projects-section';
import { ExperienceSection } from '@/components/home/experience-section';
import { BlogSection } from '@/components/home/blog-section';
import { ConnectSection } from '@/components/home/connect-section';
import { fetchExperiences, fetchPortfolio, fetchPosts } from '@/lib/data';
import { fetchSiteConfig } from '@/lib/site-config';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const config = await fetchSiteConfig(locale);

  const [{ data: posts }, { data: portfolio }, { data: experiences }] = await Promise.all([
    fetchPosts(4),
    fetchPortfolio(4),
    fetchExperiences(),
  ]);

  const twitterUrl = config.twitterHandle
    ? `https://x.com/${config.twitterHandle.replace(/^@/, '')}`
    : undefined;

  return (
    <>
      <main>
        <Container className="pb-4 pt-10">
          <IntroSection name={config.name} tagline={config.tagline} locale={locale} />

          <ProjectsSection
            items={portfolio ?? []}
            locale={locale}
            title={t('selectedProjects')}
            viewAllLabel={t('viewAllProjects')}
          />

          <ExperienceSection
            items={experiences ?? []}
            locale={locale}
            title={t('workExperience')}
            presentLabel={t('present')}
          />

          <BlogSection
            posts={posts ?? []}
            locale={locale}
            title={t('blog')}
            viewAllLabel={t('viewAllPosts')}
          />

          <ConnectSection
            title={t('connect')}
            emailPrompt={t('emailPrompt')}
            email={config.email}
            locale={locale}
            links={{
              twitter: twitterUrl,
              github: config.githubUrl,
              linkedin: config.linkedinUrl,
              instagram: config.instagramUrl,
            }}
          />
        </Container>
      </main>
      <SiteFooter name={config.name} year={new Date().getFullYear()} />
    </>
  );
}
