import {
  resolveSiteConfig,
  type SettingRecord,
  type SiteConfig,
} from '@/features/settings/site-settings';
import { getServerApiUrl } from '@/shared/lib/api-url';

export async function fetchSiteSettings(): Promise<SettingRecord[]> {
  try {
    const res = await fetch(`${getServerApiUrl()}/api/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: SettingRecord[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchSiteConfig(locale: string): Promise<SiteConfig> {
  const settings = await fetchSiteSettings();
  return resolveSiteConfig(settings, locale);
}
