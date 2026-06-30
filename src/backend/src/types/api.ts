export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER';
  avatarUrl: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
