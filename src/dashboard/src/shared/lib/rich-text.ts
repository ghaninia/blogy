/** True when rich-text HTML has no meaningful text content. */
export function isEmptyRichText(html?: string | null): boolean {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text.length === 0;
}

export function optionalRichText(html?: string | null): string | undefined {
  return isEmptyRichText(html) ? undefined : html ?? undefined;
}

export function optionalString(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
