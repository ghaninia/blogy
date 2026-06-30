import { cn as uiCn } from '@gh/ui';

export function cn(...inputs: Parameters<typeof uiCn>) {
  return uiCn(...inputs);
}

export function getLocalizedField(item: object, field: string, locale: string): string {
  const record = item as Record<string, unknown>;
  const faKey = `${field}Fa`;
  const enKey = `${field}En`;
  const faVal = record[faKey] as string | undefined;
  const enVal = record[enKey] as string | undefined;
  if (locale === 'fa') return faVal ?? enVal ?? '';
  return enVal ?? faVal ?? '';
}

export function formatDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
