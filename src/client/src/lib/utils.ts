import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleFont(locale: string, className?: string) {
  return cn(locale === 'fa' ? 'font-fa' : 'font-sans', className);
}

export function getLocalizedField(item: object, field: string, locale: string): string {
  const record = item as Record<string, unknown>;
  const faVal = record[`${field}Fa`] as string | undefined;
  const enVal = record[`${field}En`] as string | undefined;
  if (locale === 'fa') return faVal ?? enVal ?? '';
  return enVal ?? faVal ?? '';
}

export function formatDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatYear(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
  }).format(new Date(date));
}
