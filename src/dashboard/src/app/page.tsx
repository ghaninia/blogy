import { redirect } from 'next/navigation';
import { defaultLocale } from '@/shared/i18n/request';

export default function RootPage() {
  redirect(`/${defaultLocale}/dashboard`);
}
