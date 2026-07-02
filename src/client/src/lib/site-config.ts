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
  subtitle: string;
  description: string;
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
  footerCopyright: string;
  footerRights: string;
}

function pick(settings: SettingRecord[], key: string) {
  return settings.find((s) => s.key === key);
}

function localizedValue(record: SettingRecord | undefined, isFa: boolean): string {
  if (!record) return '';
  return (isFa ? record.valueFa : record.valueEn) || record.valueEn || record.valueFa || '';
}

export function resolveFooterTemplate(text: string, year: number, name: string): string {
  return text.replace(/\{year\}/g, String(year)).replace(/\{name\}/g, name);
}

export function resolveSiteConfig(settings: SettingRecord[], locale: string): SiteConfig {
  const isFa = locale === 'fa';
  const descriptionRecord = pick(settings, 'site_description') ?? pick(settings, 'site_tagline');
  const name =
    localizedValue(pick(settings, 'site_name'), isFa) ||
    pick(settings, 'site_name')?.valueEn ||
    'Blogy';

  return {
    name,
    subtitle: localizedValue(pick(settings, 'site_subtitle'), isFa),
    description: localizedValue(descriptionRecord, isFa),
    tagline: localizedValue(descriptionRecord, isFa),
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
    footerCopyright:
      localizedValue(pick(settings, 'footer_copyright'), isFa) ||
      (isFa ? '© {year} {name}.' : '© {year} {name}.'),
    footerRights:
      localizedValue(pick(settings, 'footer_rights'), isFa) ||
      (isFa ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'),
  };
}

export async function fetchSiteConfig(locale: string): Promise<SiteConfig> {
  const { data } = await apiGet<SettingRecord[]>('/api/settings', undefined, 60);
  return resolveSiteConfig(data ?? [], locale);
}
