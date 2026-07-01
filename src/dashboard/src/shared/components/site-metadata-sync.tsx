'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/shared/hooks/use-site-settings';
import { getMediaUrl } from '@/shared/api-client';

function setFavicon(href: string) {
  if (!href) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function SiteMetadataSync() {
  const { config } = useSiteSettings();

  useEffect(() => {
    const title = config.metaTitle || config.name;
    if (title) document.title = title;
    if (config.faviconPath) setFavicon(getMediaUrl(config.faviconPath));
  }, [config.metaTitle, config.name, config.faviconPath]);

  return null;
}
