import { apiGet } from './api';

export interface SettingRecord {
  id: string;
  key: string;
  valueFa?: string;
  valueEn?: string;
  valueJson?: Record<string, unknown> | null;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  logoPath: string;
  faviconPath: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImagePath: string;
  siteUrl: string;
  twitterHandle: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
}

function pick(settings: SettingRecord[], key: string) {
  return settings.find((s) => s.key === key);
}

function localizedValue(record: SettingRecord | undefined, isFa: boolean): string {
  if (!record) return '';
  return (isFa ? record.valueFa : record.valueEn) || record.valueEn || record.valueFa || '';
}

export function resolveSiteConfig(settings: SettingRecord[], locale: string): SiteConfig {
  const isFa = locale === 'fa';
  return {
    name: localizedValue(pick(settings, 'site_name'), isFa) || 'Blogy',
    tagline: localizedValue(pick(settings, 'site_tagline'), isFa),
    logoPath: pick(settings, 'site_logo')?.valueEn ?? '',
    faviconPath: pick(settings, 'site_favicon')?.valueEn ?? '',
    metaTitle: localizedValue(pick(settings, 'meta_title'), isFa),
    metaDescription: localizedValue(pick(settings, 'meta_description'), isFa),
    metaKeywords: localizedValue(pick(settings, 'meta_keywords'), isFa),
    ogImagePath: pick(settings, 'og_image')?.valueEn ?? '',
    siteUrl: pick(settings, 'site_url')?.valueEn ?? '',
    twitterHandle: pick(settings, 'twitter_handle')?.valueEn ?? '',
    email: pick(settings, 'contact_email')?.valueEn ?? '',
    githubUrl: pick(settings, 'github_url')?.valueEn ?? '',
    linkedinUrl: pick(settings, 'linkedin_url')?.valueEn ?? '',
    instagramUrl: pick(settings, 'instagram_url')?.valueEn ?? '',
  };
}

export async function fetchSiteConfig(locale: string): Promise<SiteConfig> {
  const { data } = await apiGet<SettingRecord[]>('/api/settings', undefined, 60);
  return resolveSiteConfig(data ?? [], locale);
}
