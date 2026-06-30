'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api-client';
import { getLocalizedField, isAdmin } from '@/shared/lib/localized';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';
import { useAuthStore } from '@/shared/store/auth';

interface PortfolioItem {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  isPublished: boolean;
  sortOrder: number;
  technologies: string[];
}

export default function DashboardPortfolioPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const locale = useLocale();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, DeleteDialog } = useDeleteConfirm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['dashboard-portfolio'],
    queryFn: async () => {
      const res = await api.get<PortfolioItem[]>('/api/portfolio');
      return res.data ?? [];
    },
  });

  const handleDelete = (item: PortfolioItem) => {
    confirmDelete({
      description: t('confirm.deletePortfolio'),
      onConfirm: async () => {
        try {
          await api.delete(`/api/portfolio/${item.id}`);
          toast({ title: tToast('deleted'), variant: 'success' });
          qc.invalidateQueries({ queryKey: ['dashboard-portfolio'] });
        } catch {
          toast({ title: tToast('error'), variant: 'destructive' });
        }
      },
    });
  };

  return (
    <div>
      <PageHeader
        title={t('portfolio')}
        action={
          <Link href={`/${locale}/dashboard/portfolio/new`}>
            <Button><Plus className="me-2 h-4 w-4" />{t('newPortfolio')}</Button>
          </Link>
        }
      />

      <DataTable isLoading={isLoading} isEmpty={!isLoading && items.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt('title')}</TableHead>
              <TableHead>{tt('technologies')}</TableHead>
              <TableHead>{tt('sortOrder')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
              <TableHead className="text-end">{tt('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium">{getLocalizedField(item, 'title', locale)}</p>
                  <p className="text-xs text-muted-foreground">{item.slug}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="glass">{tech}</Badge>
                    ))}
                    {item.technologies.length > 3 ? (
                      <Badge variant="secondary">+{item.technologies.length - 3}</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  <Badge variant={item.isPublished ? 'success' : 'secondary'}>
                    {item.isPublished ? tt('published') : t('draft')}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Link href={`/${locale}/dashboard/portfolio/${item.id}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    {user && isAdmin(user.role) ? (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <DeleteDialog />
    </div>
  );
}
