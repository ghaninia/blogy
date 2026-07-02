import { contentPageMetadata, renderContentPage } from '@/components/pages/content-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return contentPageMetadata(params, 'contact');
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return renderContentPage({
    params,
    slug: 'contact',
    backHref: `/${locale}`,
    backLabelKey: 'backHome',
  });
}
