'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  useToast,
} from '@gh/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/shared/api-client';
import { PageHeader } from '@/features/layout/components/page-header';
import { DataTable } from '@/features/layout/components/data-table';

interface Setting {
  id: string;
  key: string;
  valueFa?: string;
  valueEn?: string;
  valueJson?: Record<string, unknown> | null;
}

export default function DashboardSettingsPage() {
  const t = useTranslations('dashboard');
  const tf = useTranslations('dashboard.form');
  const tt = useTranslations('dashboard.table');
  const tToast = useTranslations('dashboard.toast');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [editSetting, setEditSetting] = useState<Setting | null>(null);
  const [form, setForm] = useState({ key: '', valueFa: '', valueEn: '', valueJson: '' });
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get<Setting[]>('/api/settings');
      return res.data ?? [];
    },
  });

  const openEdit = (setting: Setting) => {
    setEditSetting(setting);
    setForm({
      key: setting.key,
      valueFa: setting.valueFa ?? '',
      valueEn: setting.valueEn ?? '',
      valueJson: setting.valueJson ? JSON.stringify(setting.valueJson, null, 2) : '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let valueJson: Record<string, unknown> | undefined;
      if (form.valueJson.trim()) {
        valueJson = JSON.parse(form.valueJson) as Record<string, unknown>;
      }
      await api.put('/api/settings', {
        key: form.key,
        valueFa: form.valueFa || undefined,
        valueEn: form.valueEn || undefined,
        valueJson,
      });
      toast({ title: tToast('saved'), variant: 'success' });
      setEditSetting(null);
      qc.invalidateQueries({ queryKey: ['settings'] });
    } catch (err) {
      toast({
        title: tToast('error'),
        description: err instanceof ApiError ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('settings')} />

      <DataTable isLoading={isLoading} isEmpty={!isLoading && items.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt('key')}</TableHead>
              <TableHead>{tf('valueFa')}</TableHead>
              <TableHead>{tf('valueEn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((setting) => (
              <TableRow
                key={setting.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => openEdit(setting)}
              >
                <TableCell className="font-medium">{setting.key}</TableCell>
                <TableCell className="max-w-xs truncate">{setting.valueFa ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{setting.valueEn ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      <Dialog open={!!editSetting} onOpenChange={(open) => !open && setEditSetting(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{tf('editSetting')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label={tt('key')}>
              <Input value={form.key} disabled />
            </FormField>
            <FormField label={tf('valueFa')}>
              <Textarea value={form.valueFa} onChange={(e) => setForm({ ...form, valueFa: e.target.value })} rows={3} />
            </FormField>
            <FormField label={tf('valueEn')}>
              <Textarea value={form.valueEn} onChange={(e) => setForm({ ...form, valueEn: e.target.value })} rows={3} />
            </FormField>
            <FormField label={tf('valueJson')}>
              <Textarea
                value={form.valueJson}
                onChange={(e) => setForm({ ...form, valueJson: e.target.value })}
                rows={6}
                className="font-mono text-sm"
                placeholder="{}"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSetting(null)}>{tc('cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>{t('actions.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
