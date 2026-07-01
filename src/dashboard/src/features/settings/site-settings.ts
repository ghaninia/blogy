export interface SettingRecord {
  id: string;
  key: string;
  valueFa?: string;
  valueEn?: string;
  valueJson?: Record<string, unknown> | null;
}

export interface SiteSettingsForm {
  siteNameFa: string;
  siteNameEn: string;
  siteTaglineFa: string;
  siteTaglineEn: string;
  logoPath: string;
  faviconPath: string;
  metaTitleFa: string;
  metaTitleEn: string;
  metaDescFa: string;
  metaDescEn: string;
  metaKeywordsFa: string;
  metaKeywordsEn: string;
  ogImagePath: string;
  siteUrl: string;
  twitterHandle: string;
  googleVerification: string;
  robots: string;
}

export const SITE_SETTING_KEYS = [
  'site_name',
  'site_tagline',
  'site_logo',
  'site_favicon',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'og_image',
  'site_url',
  'twitter_handle',
  'google_verification',
  'robots',
] as const;

export function emptySiteSettings(): SiteSettingsForm {
  return {
    siteNameFa: '',
    siteNameEn: '',
    siteTaglineFa: '',
    siteTaglineEn: '',
    logoPath: '',
    faviconPath: '',
    metaTitleFa: '',
    metaTitleEn: '',
    metaDescFa: '',
    metaDescEn: '',
    metaKeywordsFa: '',
    metaKeywordsEn: '',
    ogImagePath: '',
    siteUrl: '',
    twitterHandle: '',
    googleVerification: '',
    robots: 'index, follow',
  };
}

function getSettingValue(settings: SettingRecord[], key: string): SettingRecord | undefined {
  return settings.find((s) => s.key === key);
}

export function settingsToForm(settings: SettingRecord[]): SiteSettingsForm {
  const form = emptySiteSettings();
  const siteName = getSettingValue(settings, 'site_name');
  const siteTagline = getSettingValue(settings, 'site_tagline');
  const siteLogo = getSettingValue(settings, 'site_logo');
  const siteFavicon = getSettingValue(settings, 'site_favicon');
  const metaTitle = getSettingValue(settings, 'meta_title');
  const metaDescription = getSettingValue(settings, 'meta_description');
  const metaKeywords = getSettingValue(settings, 'meta_keywords');
  const ogImage = getSettingValue(settings, 'og_image');
  const siteUrl = getSettingValue(settings, 'site_url');
  const twitterHandle = getSettingValue(settings, 'twitter_handle');
  const googleVerification = getSettingValue(settings, 'google_verification');
  const robots = getSettingValue(settings, 'robots');

  if (siteName) {
    form.siteNameFa = siteName.valueFa ?? '';
    form.siteNameEn = siteName.valueEn ?? '';
  }
  if (siteTagline) {
    form.siteTaglineFa = siteTagline.valueFa ?? '';
    form.siteTaglineEn = siteTagline.valueEn ?? '';
  }
  if (siteLogo) form.logoPath = siteLogo.valueEn ?? '';
  if (siteFavicon) form.faviconPath = siteFavicon.valueEn ?? '';
  if (metaTitle) {
    form.metaTitleFa = metaTitle.valueFa ?? '';
    form.metaTitleEn = metaTitle.valueEn ?? '';
  }
  if (metaDescription) {
    form.metaDescFa = metaDescription.valueFa ?? '';
    form.metaDescEn = metaDescription.valueEn ?? '';
  }
  if (metaKeywords) {
    form.metaKeywordsFa = metaKeywords.valueFa ?? '';
    form.metaKeywordsEn = metaKeywords.valueEn ?? '';
  }
  if (ogImage) form.ogImagePath = ogImage.valueEn ?? '';
  if (siteUrl) form.siteUrl = siteUrl.valueEn ?? '';
  if (twitterHandle) form.twitterHandle = twitterHandle.valueEn ?? '';
  if (googleVerification) form.googleVerification = googleVerification.valueEn ?? '';
  if (robots) form.robots = robots.valueEn ?? form.robots;

  return form;
}

export function formToSettingUpdates(form: SiteSettingsForm) {
  return [
    { key: 'site_name', valueFa: form.siteNameFa || undefined, valueEn: form.siteNameEn || undefined },
    { key: 'site_tagline', valueFa: form.siteTaglineFa || undefined, valueEn: form.siteTaglineEn || undefined },
    { key: 'site_logo', valueEn: form.logoPath || undefined },
    { key: 'site_favicon', valueEn: form.faviconPath || undefined },
    { key: 'meta_title', valueFa: form.metaTitleFa || undefined, valueEn: form.metaTitleEn || undefined },
    { key: 'meta_description', valueFa: form.metaDescFa || undefined, valueEn: form.metaDescEn || undefined },
    { key: 'meta_keywords', valueFa: form.metaKeywordsFa || undefined, valueEn: form.metaKeywordsEn || undefined },
    { key: 'og_image', valueEn: form.ogImagePath || undefined },
    { key: 'site_url', valueEn: form.siteUrl || undefined },
    { key: 'twitter_handle', valueEn: form.twitterHandle || undefined },
    { key: 'google_verification', valueEn: form.googleVerification || undefined },
    { key: 'robots', valueEn: form.robots || undefined },
  ];
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
  googleVerification: string;
  robots: string;
}

export function resolveSiteConfig(settings: SettingRecord[], locale: string): SiteConfig {
  const form = settingsToForm(settings);
  const isFa = locale === 'fa';

  return {
    name: (isFa ? form.siteNameFa : form.siteNameEn) || form.siteNameEn || form.siteNameFa,
    tagline: (isFa ? form.siteTaglineFa : form.siteTaglineEn) || form.siteTaglineEn || form.siteTaglineFa,
    logoPath: form.logoPath,
    faviconPath: form.faviconPath,
    metaTitle: (isFa ? form.metaTitleFa : form.metaTitleEn) || form.metaTitleEn || form.metaTitleFa,
    metaDescription: (isFa ? form.metaDescFa : form.metaDescEn) || form.metaDescEn || form.metaDescFa,
    metaKeywords: (isFa ? form.metaKeywordsFa : form.metaKeywordsEn) || form.metaKeywordsEn || form.metaKeywordsFa,
    ogImagePath: form.ogImagePath,
    siteUrl: form.siteUrl,
    twitterHandle: form.twitterHandle,
    googleVerification: form.googleVerification,
    robots: form.robots,
  };
}
