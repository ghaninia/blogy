'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Skeleton,
  Switch,
  useToast,
} from '@gh/ui';
import { api } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';

interface NavigationItem {
  id: string;
  labelFa: string;
  labelEn: string;
  href: string;
  enabled: boolean;
}

interface NavigationConfig {
  header: NavigationItem[];
  footer: NavigationItem[];
}

interface SettingRecord {
  key: string;
  valueJson?: Record<string, unknown> | null;
}

const defaultItems: NavigationItem[] = [
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

function normalizeItems(value: unknown): NavigationItem[] | null {
  if (!Array.isArray(value)) return null;
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Partial<NavigationItem>;
    if (typeof record.href !== 'string') return [];
    return [
      {
        id: typeof record.id === 'string' ? record.id : `menu-${index}`,
        labelFa: typeof record.labelFa === 'string' ? record.labelFa : '',
        labelEn: typeof record.labelEn === 'string' ? record.labelEn : '',
        href: record.href,
        enabled: record.enabled !== false,
      },
    ];
  });
}

export default function DashboardNavigationPage() {
  const t = useTranslations('dashboard');
  const tn = useTranslations('dashboard.navigationPage');
  const tf = useTranslations('dashboard.form');
  const toastText = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [navigation, setNavigation] = useState<NavigationConfig>({
    header: defaultItems,
    footer: defaultItems,
  });
  const [saving, setSaving] = useState(false);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get<SettingRecord[]>('/api/settings');
      return response.data ?? [];
    },
  });

  useEffect(() => {
    const saved = data.find((setting) => setting.key === 'site_navigation')?.valueJson;
    if (!saved) return;
    setNavigation({
      header: normalizeItems(saved.header) ?? defaultItems,
      footer: normalizeItems(saved.footer) ?? defaultItems,
    });
  }, [data]);

  const updateItem = (
    section: keyof NavigationConfig,
    id: string,
    patch: Partial<NavigationItem>,
  ) => {
    setNavigation((current) => ({
      ...current,
      [section]: current[section].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const reorder = (section: keyof NavigationConfig, index: number, direction: -1 | 1) => {
    setNavigation((current) => {
      const items = [...current[section]];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= items.length) return current;
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
      return { ...current, [section]: items };
    });
  };

  const addItem = (section: keyof NavigationConfig) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `menu-${Date.now()}`;
    setNavigation((current) => ({
      ...current,
      [section]: [...current[section], { id, labelFa: '', labelEn: '', href: '', enabled: true }],
    }));
  };

  const removeItem = (section: keyof NavigationConfig, id: string) => {
    setNavigation((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== id),
    }));
  };

  const save = async () => {
    const allItems = [...navigation.header, ...navigation.footer];
    const validHref = (href: string) => href.startsWith('/') || /^https?:\/\//i.test(href);
    if (
      allItems.some(
        (item) =>
          !item.href || !validHref(item.href) || !item.labelFa.trim() || !item.labelEn.trim(),
      )
    ) {
      toast({ title: tn('validationError'), variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await api.put('/api/settings', { key: 'site_navigation', valueJson: navigation });
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: toastText('saved'), variant: 'success' });
    } catch {
      toast({ title: toastText('error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (section: keyof NavigationConfig, title: string) => (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{tn('sectionHint')}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => addItem(section)}>
          <Plus className="me-2 h-4 w-4" />
          {tn('addItem')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {navigation[section].map((item, index) => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                {/^https?:\/\//i.test(item.href) ? (
                  <ExternalLink
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-label={tn('externalLink')}
                  />
                ) : null}
                <span className="text-xs text-muted-foreground">{tn('visible')}</span>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(enabled) => updateItem(section, item.id, { enabled })}
                  aria-label={`${tn('visible')}: ${item.labelEn || item.href || index + 1}`}
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={tn('moveUp')}
                  disabled={index === 0}
                  onClick={() => reorder(section, index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={tn('moveDown')}
                  disabled={index === navigation[section].length - 1}
                  onClick={() => reorder(section, index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  aria-label={`${t('actions.delete')}: ${item.labelEn || item.href}`}
                  onClick={() => removeItem(section, item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <FormField label={tf('nameFa')}>
                <Input
                  value={item.labelFa}
                  onChange={(event) =>
                    updateItem(section, item.id, { labelFa: event.target.value })
                  }
                  dir="rtl"
                />
              </FormField>
              <FormField label={tf('nameEn')}>
                <Input
                  value={item.labelEn}
                  onChange={(event) =>
                    updateItem(section, item.id, { labelEn: event.target.value })
                  }
                  dir="ltr"
                />
              </FormField>
              <FormField label={tn('url')}>
                <Input
                  value={item.href}
                  onChange={(event) => updateItem(section, item.id, { href: event.target.value })}
                  dir="ltr"
                  placeholder="/blog or https://example.com"
                />
              </FormField>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title={t('navigation')}
        description={tn('description')}
        action={
          <Button onClick={save} disabled={saving || isLoading || isError}>
            {t('actions.save')}
          </Button>
        }
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card variant="glass">
          <CardContent className="py-12 text-center text-sm text-destructive" role="alert">
            {tn('loadError')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {renderSection('header', tn('header'))}
          {renderSection('footer', tn('footer'))}
        </div>
      )}
    </div>
  );
}
