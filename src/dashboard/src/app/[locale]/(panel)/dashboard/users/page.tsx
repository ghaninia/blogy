'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@gh/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';
import { useCrudList } from '@/shared/hooks/use-crud-list';
import { DASHBOARD_LIST_PAGE_SIZE } from '@/shared/constants/list-pagination';

interface UserItem {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER';
  isActive: boolean;
}

const ROLES = ['ADMIN', 'EDITOR', 'AUTHOR', 'USER'] as const;

export default function DashboardUsersPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('dashboard.table');
  const ts = useTranslations('status');
  const tToast = useTranslations('dashboard.toast');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { items, meta, isLoading } = useCrudList<UserItem>({
    queryKey: ['dashboard-users'],
    endpoint: '/api/auth/users',
    params: { page, limit: DASHBOARD_LIST_PAGE_SIZE },
  });

  const updateRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/api/auth/users/${userId}/role`, { role });
      toast({ title: tToast('roleUpdated'), variant: 'success' });
      qc.invalidateQueries({ queryKey: ['dashboard-users'] });
    } catch {
      toast({ title: tToast('error'), variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title={t('users')} />

      <DataTable
        isLoading={isLoading}
        isEmpty={!isLoading && items.length === 0}
        pagination={{ page, meta, onPageChange: setPage }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt('user')}</TableHead>
              <TableHead>{tt('email')}</TableHead>
              <TableHead>{tt('role')}</TableHead>
              <TableHead>{tt('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="font-medium">{user.displayName ?? user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={(role) => updateRole(user.id, role)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? ts('active') : ts('inactive')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
}
