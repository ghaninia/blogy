import { prisma, type Prisma } from '../../../db/index.js';
import type { UpdateSettingInput } from '../../../types/index.js';

export class SettingRepository {
  upsert(input: UpdateSettingInput) {
    const data = {
      key: input.key,
      valueFa: input.valueFa,
      valueEn: input.valueEn,
      valueJson: input.valueJson as Prisma.InputJsonValue | undefined,
    };
    return prisma.setting.upsert({
      where: { key: input.key },
      create: data,
      update: data,
    });
  }

  findByKey(key: string) {
    return prisma.setting.findUnique({ where: { key } });
  }

  findAll() {
    return prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }
}

export const settingRepository = new SettingRepository();
