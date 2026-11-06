import { apiGet } from './api';

export interface SettingRecord {
  id: string;
  key: string;
  valueFa?: string;
  valueEn?: string;
  valueJson?: Record<string, unknown> | null;
}

export interface SiteNavigationItem {
  id: string;
  labelFa: string;
  labelEn: string;
  href: string;
  enabled: boolean;
}

function isNavigationItem(value: unknown): value is SiteNavigationItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SiteNavigationItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.labelFa === 'string' &&
    typeof item.labelEn === 'string' &&
    typeof item.href === 'string' &&
    typeof item.enabled === 'boolean'
  );
}

const defaultHeaderNavigation: SiteNavigationItem[] = [
  { id: 'home', labelFa: 'خانه', labelEn: 'Home', href: '/', enabled: true },
  { id: 'blog', labelFa: 'وبلاگ', labelEn: 'Blog', href: '/blog', enabled: true },
  {
    id: 'portfolio',
    labelFa: 'نمونه‌کارها',
    labelEn: 'Portfolio',
    href: '/portfolio',
    enabled: true,
  },
  { id: 'about', labelFa: 'درباره', labelEn: 'About', href: '/about', enabled: true },
  { id: 'contact', labelFa: 'تماس', labelEn: 'Contact', href: '/contact', enabled: true },
];

export interface SiteConfig {
  accentColor: 'violet' | 'blue' | 'green' | 'rose';
  headerNavigation: SiteNavigationItem[];
  footerNavigation: SiteNavigationItem[];
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
  const configuredAccent = pick(settings, 'site_appearance')?.valueJson?.accent;
  const accentColor = ['violet', 'blue', 'green', 'rose'].includes(String(configuredAccent))
    ? (configuredAccent as SiteConfig['accentColor'])
    : 'violet';
  const navigationData = pick(settings, 'site_navigation')?.valueJson;
  const configuredNavigation = navigationData?.header;
  const configuredFooterNavigation = navigationData?.footer;
  const headerNavigation = Array.isArray(configuredNavigation)
    ? configuredNavigation.filter(isNavigationItem).filter((item) => item.enabled)
    : defaultHeaderNavigation;
  const footerNavigation = Array.isArray(configuredFooterNavigation)
    ? configuredFooterNavigation.filter(isNavigationItem).filter((item) => item.enabled)
    : defaultHeaderNavigation;
  const descriptionRecord = pick(settings, 'site_description') ?? pick(settings, 'site_tagline');
  const name =
    localizedValue(pick(settings, 'site_name'), isFa) ||
    pick(settings, 'site_name')?.valueEn ||
    'Blogy';

  return {
    accentColor,
    headerNavigation,
    footerNavigation,
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
