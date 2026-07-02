import type { ApiResponse } from '@gh/backend/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private refreshPromise: Promise<boolean> | null = null;

  private buildUrl(path: string): string {
    return `${API_URL}${path}`;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(this.buildUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      return (await response.json()) as ApiResponse<T>;
    } catch {
      throw new ApiError('Invalid response from server', response.status);
    }
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    const requestInit: RequestInit = {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    };

    let response = await fetch(this.buildUrl(path), requestInit);

    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        response = await fetch(this.buildUrl(path), requestInit);
      }
    }

    const data = await this.parseResponse<T>(response);

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message ?? 'Request failed',
        response.status,
        data.error?.code,
      );
    }

    return data;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }
}

export const api = new ApiClient();
