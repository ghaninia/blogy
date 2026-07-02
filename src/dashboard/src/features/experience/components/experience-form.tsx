'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Switch,
} from '@gh/ui';

export interface ExperienceFormData {
  titleFa: string;
  titleEn: string;
  companyFa: string;
  companyEn: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  sortOrder: number;
}

export const emptyExperienceForm = (): ExperienceFormData => ({
  titleFa: '',
  titleEn: '',
  companyFa: '',
  companyEn: '',
  startDate: '',
  endDate: '',
  isPublished: false,
  sortOrder: 0,
});

interface ExperienceFormProps {
  form: ExperienceFormData;
  onChange: (form: ExperienceFormData) => void;
}

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function experienceToForm(item: Record<string, unknown>) {
  return {
    titleFa: (item.titleFa as string) ?? '',
    titleEn: (item.titleEn as string) ?? '',
    companyFa: (item.companyFa as string) ?? '',
    companyEn: (item.companyEn as string) ?? '',
    startDate: toDateInput(item.startDate as string),
    endDate: toDateInput(item.endDate as string | null),
    isPublished: (item.isPublished as boolean) ?? false,
    sortOrder: (item.sortOrder as number) ?? 0,
  } satisfies ExperienceFormData;
}

export function formToExperiencePayload(form: ExperienceFormData) {
  return {
    titleFa: form.titleFa,
    titleEn: form.titleEn,
    companyFa: form.companyFa,
    companyEn: form.companyEn,
    startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    isPublished: form.isPublished,
    sortOrder: form.sortOrder,
  };
}

export function ExperienceForm({ form, onChange }: ExperienceFormProps) {
  const tf = useTranslations('dashboard.form');

  const set = (patch: Partial<ExperienceFormData>) => onChange({ ...form, ...patch });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{tf('content')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={tf('titleFa')}>
            <Input value={form.titleFa} onChange={(e) => set({ titleFa: e.target.value })} dir="rtl" />
          </FormField>
          <FormField label={tf('titleEn')}>
            <Input value={form.titleEn} onChange={(e) => set({ titleEn: e.target.value })} />
          </FormField>
          <FormField label={tf('companyFa')}>
            <Input value={form.companyFa} onChange={(e) => set({ companyFa: e.target.value })} dir="rtl" />
          </FormField>
          <FormField label={tf('companyEn')}>
            <Input value={form.companyEn} onChange={(e) => set({ companyEn: e.target.value })} />
          </FormField>
          <FormField label={tf('startDate')}>
            <Input type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} />
          </FormField>
          <FormField label={tf('endDateOptional')}>
            <Input type="date" value={form.endDate} onChange={(e) => set({ endDate: e.target.value })} />
          </FormField>
          <FormField label={tf('sortOrder')}>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set({ sortOrder: Number(e.target.value) || 0 })}
            />
          </FormField>
          <FormField label={tf('isPublished')}>
            <Switch checked={form.isPublished} onCheckedChange={(v) => set({ isPublished: v })} />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
