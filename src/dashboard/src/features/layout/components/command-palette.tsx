'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Command, FileText, FolderTree, LoaderCircle, Search, Tag } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from '@gh/ui';
import { api } from '@/shared/api-client';
import { getLocalizedField } from '@/shared/lib/localized';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';

interface SearchRecord {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  nameFa?: string;
  nameEn?: string;
}

interface SearchResult {
  id: string;
  title: string;
  detail: string;
  href: string;
  type: string;
  icon: typeof FileText;
}

export function CommandPalette() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tc = useTranslations('dashboard.command');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 180);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['dashboard-command-search', debouncedSearch],
    enabled: open && debouncedSearch.trim().length >= 2,
    staleTime: 30_000,
    queryFn: async () => {
      const paths = [
        {
          endpoint: '/api/posts',
          kind: t('posts'),
          icon: FileText,
          route: 'posts',
          field: 'title',
        },
        {
          endpoint: '/api/pages',
          kind: t('pages'),
          icon: FileText,
          route: 'pages',
          field: 'title',
        },
        {
          endpoint: '/api/categories',
          kind: t('categories'),
          icon: FolderTree,
          route: 'categories',
          field: 'name',
        },
        { endpoint: '/api/tags', kind: t('tags'), icon: Tag, route: 'tags', field: 'name' },
      ] as const;

      const responses = await Promise.allSettled(
        paths.map(({ endpoint }) =>
          api.get<SearchRecord[]>(endpoint, { search: debouncedSearch.trim(), limit: 5 }),
        ),
      );

      return responses.flatMap((response, index) => {
        if (response.status !== 'fulfilled') return [];
        const config = paths[index];
        return (response.value.data ?? []).map((item) => {
          const title = getLocalizedField(item, config.field, locale) || item.slug;
          return {
            id: item.id,
            title,
            detail: item.slug,
            href: `/${locale}/dashboard/${config.route}/${item.id}/edit`,
            type: config.kind,
            icon: config.icon,
          } satisfies SearchResult;
        });
      });
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-9 justify-start gap-2 rounded-full px-3 text-muted-foreground sm:min-w-44 lg:min-w-56"
        onClick={() => setOpen(true)}
        aria-label={tc('open')}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden flex-1 text-start text-xs sm:inline">{tc('search')}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
          <Command className="me-0.5 h-3 w-3" />K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[18%] max-w-xl translate-y-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{tc('open')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tc('placeholder')}
              aria-label={tc('placeholder')}
              className="h-14 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            {isFetching ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2" aria-live="polite">
            {search.trim().length < 2 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">{tc('hint')}</p>
            ) : isError ? (
              <p className="px-3 py-8 text-center text-sm text-destructive" role="alert">
                {tc('error')}
              </p>
            ) : !isFetching && results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {tc('noResults')}
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{result.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {result.detail}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">{result.type}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
