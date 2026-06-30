import type { UpdateSettingInput } from '../../../types/index.js';
import { settingRepository } from '../infrastructure/setting.repository.js';

export class SettingService {
  async upsert(input: UpdateSettingInput) {
    return settingRepository.upsert(input);
  }

  async getByKey(key: string) {
    return settingRepository.findByKey(key);
  }

  async list() {
    return settingRepository.findAll();
  }
}

export const settingService = new SettingService();
