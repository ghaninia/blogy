'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { api } from '@/shared/api-client';
import {
  resolveSiteConfig,
  type SettingRecord,
  type SiteConfig,
} from '@/features/settings/site-settings';

export function useSiteSettings() {
  const locale = useLocale();

  const query = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await api.get<SettingRecord[]>('/api/settings');
      return res.data ?? [];
    },
  });

  const config: SiteConfig = resolveSiteConfig(query.data ?? [], locale);

  return {
    ...query,
    config,
  };
}
