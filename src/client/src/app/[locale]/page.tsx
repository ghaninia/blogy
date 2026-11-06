import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { IntroSection } from '@/components/home/intro-section';
import { ProjectsSection } from '@/components/home/projects-section';
import { ExperienceSection } from '@/components/home/experience-section';
import { BlogSection } from '@/components/home/blog-section';
import { ConnectSection } from '@/components/home/connect-section';
import { fetchExperiences, fetchPortfolio, fetchPosts } from '@/lib/data';
import { fetchSiteConfig, getSiteBaseUrl } from '@/lib/site-config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = await fetchSiteConfig(locale);
  let canonical = `${getSiteBaseUrl(config.siteUrl)}/${locale}`;
  if (config.canonicalUrl) {
    try {
      const configured = new URL(config.canonicalUrl);
      if (configured.protocol === 'http:' || configured.protocol === 'https:') {
        canonical = configured.toString();
      }
    } catch {
      // Fall back to the localized homepage when a legacy canonical value is invalid.
    }
  }

  return {
    title: config.metaTitle || config.name,
    description: config.metaDescription || config.description || config.tagline || undefined,
    alternates: { canonical },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const config = await fetchSiteConfig(locale);

  const [{ data: posts }, { data: portfolio }, { data: experiences }] = await Promise.all([
    fetchPosts(4, 1),
    fetchPortfolio(4),
    fetchExperiences(),
  ]);

  const twitterUrl = config.twitterHandle
    ? `https://x.com/${config.twitterHandle.replace(/^@/, '')}`
    : undefined;

  const sectionContent = {
    projects: (
      <ProjectsSection
        items={portfolio ?? []}
        locale={locale}
        title={t('selectedProjects')}
        viewAllLabel={t('viewAllProjects')}
      />
    ),
    experience: (
      <ExperienceSection
        items={experiences ?? []}
        locale={locale}
        title={t('workExperience')}
        presentLabel={t('present')}
      />
    ),
    blog: (
      <BlogSection
        posts={posts ?? []}
        locale={locale}
        title={t('blog')}
        viewAllLabel={t('viewAllPosts')}
      />
    ),
  };
  const sectionOrder = {
    editorial: ['projects', 'experience', 'blog'],
    'blog-first': ['blog', 'projects', 'experience'],
    'portfolio-first': ['projects', 'blog', 'experience'],
  } satisfies Record<typeof config.homepageLayout, (keyof typeof sectionContent)[]>;

  return (
    <>
      <main>
        <Container className="pb-4 pt-10">
          <IntroSection
            name={config.name}
            subtitle={config.subtitle}
            description={config.description}
            locale={locale}
          />

          {sectionOrder[config.homepageLayout].map((section) => (
            <div key={section}>{sectionContent[section]}</div>
          ))}

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
      <SiteFooter
        name={config.name}
        year={new Date().getFullYear()}
        footerCopyright={config.footerCopyright}
        footerRights={config.footerRights}
        locale={locale}
        navigation={config.footerNavigation}
      />
    </>
  );
}
