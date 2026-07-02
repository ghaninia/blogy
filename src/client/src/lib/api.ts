import type { ApiResponse } from '@gh/backend/types';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getServerApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

interface FetchParams {
  [key: string]: string | number | undefined;
}

function buildUrl(path: string, params?: FetchParams): string {
  const url = new URL(`${getServerApiUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Server-side fetch against the public API. Returns null on failure so
 * pages can render gracefully instead of throwing.
 */
export async function apiGet<T>(
  path: string,
  params?: FetchParams,
  revalidate = 60,
): Promise<{ data: T | null; meta?: unknown }> {
  try {
    const res = await fetch(buildUrl(path, params), { next: { revalidate } });
    if (!res.ok) return { data: null };
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) return { data: null };
    return { data: json.data ?? null, meta: json.meta };
  } catch {
    return { data: null };
  }
}

export function getMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const normalized = pathOrUrl.replace(/\\/g, '/').replace(/^\/?uploads\//, '');
  return `${PUBLIC_API_URL}/uploads/${normalized}`;
}
