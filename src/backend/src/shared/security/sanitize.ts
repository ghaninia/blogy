import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'pre',
  'code',
  'blockquote',
  'figure',
  'figcaption',
  'iframe',
  'video',
  'source',
];

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'alt', 'title', 'width', 'height', 'class'],
  a: ['href', 'name', 'target', 'rel', 'class'],
  code: ['class'],
  pre: ['class'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'class'],
  '*': ['class', 'id'],
};

export function sanitizeRichText(html: string | undefined | null): string | undefined {
  if (!html) return undefined;
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  });
}

export function sanitizeOptionalFields<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
): T {
  const result = { ...data };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field] = sanitizeRichText(result[field] as string);
    }
  }
  return result;
}
