import { contentPageMetadata, renderContentPage } from '@/components/pages/content-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return contentPageMetadata(params, 'about');
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return renderContentPage({
    params,
    slug: 'about',
    backHref: `/${locale}`,
    backLabelKey: 'backHome',
  });
}
