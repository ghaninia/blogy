'use client';

import { useQuery } from '@tanstack/react-query';
import { api, getPaginationMeta, type PaginationMeta } from '@/shared/api-client';

interface UseCrudListOptions {
  queryKey: string[];
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  enabled?: boolean;
}

export function useCrudList<T>({
  queryKey,
  endpoint,
  params,
  enabled = true,
}: UseCrudListOptions) {
  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const res = await api.get<T[]>(endpoint, params);
      return {
        items: res.data ?? [],
        meta: getPaginationMeta(res) as PaginationMeta | undefined,
      };
    },
    enabled,
  });

  return {
    items: query.data?.items ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
