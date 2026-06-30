export function getLocalizedField(
  item: object,
  field: string,
  locale: string,
): string {
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
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function canDeletePost(role: string): boolean {
  return ['ADMIN', 'EDITOR'].includes(role);
}

export function canEditContent(role: string): boolean {
  return ['ADMIN', 'EDITOR', 'AUTHOR'].includes(role);
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}
