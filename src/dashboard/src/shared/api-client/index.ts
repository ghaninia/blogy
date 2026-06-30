import type { ApiResponse } from '@gh/backend/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...init } = options;
    const response = await fetch(this.buildUrl(path, params), {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });

    let data: ApiResponse<T>;
    try {
      data = (await response.json()) as ApiResponse<T>;
    } catch {
      throw new ApiError('Invalid response from server', response.status);
    }

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message ?? 'Request failed',
        response.status,
        data.error?.code,
        data.error?.details,
      );
    }
    return data;
  }

  get<T>(path: string, params?: Record<string, string | number | undefined>) {
    return this.request<T>(path, { method: 'GET', params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, file: File, folder?: string): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !data.success) {
      throw new ApiError(data.error?.message ?? 'Upload failed', response.status);
    }
    return data;
  }
}

export const api = new ApiClient(API_URL);

export function getMediaUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_URL}/uploads/${path.replace(/\\/g, '/')}`;
}

export function getPaginationMeta(response: ApiResponse<unknown>): PaginationMeta | undefined {
  return response.meta as PaginationMeta | undefined;
}
