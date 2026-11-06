'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Clock3,
  Download,
  Eye,
  FileText,
  RefreshCw,
  UsersRound,
} from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gh/ui';
import { api, getPaginationMeta } from '@/shared/api-client';
import { formatDate, getLocalizedField } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';

type Range = 7 | 30 | 90 | 'custom';

interface PostRecord {
  id: string;
  slug: string;
  titleFa?: string;
  titleEn?: string;
  publishedAt?: string;
  status: string;
}

function makeSampleSeries(days: number, baseline: number, trend: number): number[] {
  return Array.from({ length: days }, (_, index) => {
    const weeklyVariation = ((index * 17) % 23) - 11;
    return Math.max(8, Math.round(baseline + index * trend + weeklyVariation));
  });
}

const sampleSeries: Record<Exclude<Range, 'custom'>, number[]> = {
  7: [34, 46, 39, 62, 55, 76, 68],
  30: makeSampleSeries(30, 36, 0.7),
  90: makeSampleSeries(90, 28, 0.55),
};

const trafficSources = [
  { key: 'direct', value: 42 },
  { key: 'search', value: 31 },
  { key: 'social', value: 18 },
  { key: 'referral', value: 9 },
] as const;

const devices = [
  { key: 'desktop', value: 56 },
  { key: 'mobile', value: 38 },
  { key: 'tablet', value: 6 },
] as const;

function toDateInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function getDateRangeLength(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

function getCustomSampleSeries(days: number): number[] {
  const bucketCount = Math.min(days, 90);
  return Array.from({ length: bucketCount }, (_, index) => {
    const sampleIndex = Math.floor(
      (index / Math.max(bucketCount - 1, 1)) * (sampleSeries[90].length - 1),
    );
    return sampleSeries[90][sampleIndex];
  });
}

function formatCsvDate(from: string, to: string, index: number, count: number, locale: string) {
  const start = new Date(`${from}T00:00:00Z`);
  const days = getDateRangeLength(from, to);
  const offset = Math.round((index / Math.max(count - 1, 1)) * (days - 1));
  start.setUTCDate(start.getUTCDate() + offset);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' }).format(start);
}

function getPeriodBounds(days: number): { from: string; to: string } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { from: toDateInputValue(start), to: toDateInputValue(end) };
}

function SampleViewsChart({ values, label }: { values: number[]; label: string }) {
  const width = 720;
  const height = 220;
  const inset = { top: 16, right: 8, bottom: 16, left: 8 };
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x =
      inset.left + (index / Math.max(values.length - 1, 1)) * (width - inset.left - inset.right);
    const y = height - inset.bottom - (value / max) * (height - inset.top - inset.bottom);
    return { x, y, value };
  });
  const path = points.map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-52 w-full overflow-visible"
      role="img"
      aria-label={label}
    >
      {[0.25, 0.5, 0.75, 1].map((fraction) => {
        const y = height - inset.bottom - fraction * (height - inset.top - inset.bottom);
        return (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={y}
            y2={y}
            stroke="hsl(var(--border))"
            strokeDasharray="3 5"
          />
        );
      })}
      <polyline
        points={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="hsl(var(--surface))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        >
          <title>{point.value}</title>
        </circle>
      ))}
    </svg>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Eye;
}) {
  return (
    <Card variant="glass" className="h-full">
      <CardContent className="flex h-full items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

export default function DashboardAnalyticsPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const ta = useTranslations('dashboard.analyticsPage');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const [range, setRange] = useState<Range>(30);
  const [customFrom, setCustomFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return toDateInputValue(date);
  });
  const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()));
  const numberFormat = new Intl.NumberFormat(locale);
  const customRangeDays = getDateRangeLength(customFrom, customTo);
  const isCustomRangeValid = customRangeDays > 0 && customRangeDays <= 365;
  const chartValues =
    range === 'custom'
      ? isCustomRangeValid
        ? getCustomSampleSeries(customRangeDays)
        : sampleSeries[30]
      : sampleSeries[range];

  const exportSampleCsv = () => {
    if (range === 'custom' && !isCustomRangeValid) return;
    const period = range === 'custom' ? { from: customFrom, to: customTo } : getPeriodBounds(range);
    const rows = [
      [ta('csvDate'), ta('csvViews')],
      ...chartValues.map((views, index) => [
        formatCsvDate(period.from, period.to, index, chartValues.length, locale),
        String(views),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `blogy-sample-analytics-${range === 'custom' ? `${customFrom}-${customTo}` : `${range}d`}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-analytics-posts', locale],
    queryFn: async () => {
      const response = await api.get<PostRecord[]>('/api/posts', {
        page: 1,
        limit: 5,
        status: 'PUBLISHED',
      });
      return { posts: response.data ?? [], meta: getPaginationMeta(response) };
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={t('analytics')}
        description={ta('description')}
        action={<Badge variant="secondary">{ta('demo')}</Badge>}
      />

      <div
        className="rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-foreground"
        role="note"
      >
        {ta('demoNotice')}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label={ta('publishedPosts')}
          value={isLoading ? '—' : numberFormat.format(data?.meta?.total ?? 0)}
          detail=""
          icon={FileText}
        />
        <MetricCard
          label={ta('views')}
          value={numberFormat.format(4821)}
          detail="+12.4%"
          icon={Eye}
        />
        <MetricCard
          label={ta('visitors')}
          value={numberFormat.format(2940)}
          detail="+8.1%"
          icon={UsersRound}
        />
        <MetricCard
          label={ta('readingTime')}
          value={locale === 'fa' ? '۴:۱۸' : '4m 18s'}
          detail=""
          icon={Clock3}
        />
        <MetricCard label={ta('engagement')} value="68%" detail="" icon={ArrowUpRight} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.85fr)]">
        <Card variant="glass">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div>
              <p className="text-xs text-muted-foreground">{ta('demo')}</p>
              <CardTitle className="mt-1 text-base">{ta('viewsOverTime')}</CardTitle>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
            >
              <div className="flex gap-1 rounded-lg bg-muted p-1"
              role="group"
              aria-label={ta('viewsOverTime')}
            >
              {([7, 30, 90, 'custom'] as const).map((selectedRange) => (
                <Button
                  key={selectedRange}
                  type="button"
                  size="sm"
                  variant={range === selectedRange ? 'secondary' : 'ghost'}
                  className="h-8 px-2.5 text-xs"
                  aria-pressed={range === selectedRange}
                  onClick={() => setRange(selectedRange)}
                >
                  {selectedRange === 'custom'
                    ? ta('rangeCustom')
                    : ta(`range${selectedRange}` as 'range7')}
                </Button>
              ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportSampleCsv}
                disabled={range === 'custom' && !isCustomRangeValid}
              >
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                {ta('exportCsv')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {range === 'custom' ? (
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <label className="grid gap-1 text-xs text-muted-foreground">
                  <span>{ta('fromDate')}</span>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="date"
                    value={customFrom}
                    max={customTo}
                    aria-label={ta('fromDate')}
                    onChange={(event) => setCustomFrom(event.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-xs text-muted-foreground">
                  <span>{ta('toDate')}</span>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="date"
                    value={customTo}
                    min={customFrom}
                    aria-label={ta('toDate')}
                    onChange={(event) => setCustomTo(event.target.value)}
                  />
                </label>
                {isCustomRangeValid ? null : (
                  <p className="text-xs text-destructive" role="alert">
                    {ta('invalidDateRange')}
                  </p>
                )}
              </div>
            ) : null}
            <SampleViewsChart
              values={chartValues}
              label={
                range === 'custom'
                  ? ta('customChartLabel', { from: customFrom, to: customTo })
                  : ta('chartLabel', { days: range })
              }
            />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">{ta('topPosts')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 px-5 pb-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div
                className="flex items-center justify-between gap-3 px-5 pb-5 text-sm"
                role="alert"
              >
                <span className="text-muted-foreground">{tt('loadError')}</span>
                <Button variant="ghost" size="sm" onClick={() => void refetch()}>
                  <RefreshCw className="me-2 h-4 w-4" />
                  {tt('retry')}
                </Button>
              </div>
            ) : data?.posts.length ? (
              <ol className="divide-y divide-border">
                {data.posts.map((post, index) => (
                  <li key={post.id}>
                    <Link
                      href={`/${locale}/dashboard/posts/${post.id}/edit`}
                      className="flex items-center gap-3 px-5 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {getLocalizedField(post, 'title', locale) || post.slug}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {post.publishedAt
                            ? formatDate(post.publishedAt, locale)
                            : ts('PUBLISHED')}
                        </span>
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {numberFormat.format(Math.max(450, 1540 - index * 230))}{' '}
                        {ta('samplePostViews')}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted-foreground">{tt('empty')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="glass">
          <CardHeader>
            <p className="text-xs text-muted-foreground">{ta('demo')}</p>
            <CardTitle className="text-base">{ta('trafficSources')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.key}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span>{ta(source.key)}</span>
                  <span className="tabular-nums text-muted-foreground">{source.value}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${ta(source.key)} ${source.value}%`}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${source.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <p className="text-xs text-muted-foreground">{ta('demo')}</p>
            <CardTitle className="text-base">{ta('audienceDevices')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {devices.map((device) => (
              <div key={device.key} className="rounded-xl border border-border bg-surface/60 p-4">
                <p className="text-sm text-muted-foreground">{ta(device.key)}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{device.value}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
