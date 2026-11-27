import { Injectable } from '@angular/core';
import { chatDB } from '@shared/db';
import { isModelId } from '@ai-chat/contracts';
import { SettingKey, SettingsMap } from './settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  async getSetting<K extends SettingKey>(key: K): Promise<SettingsMap[K] | null> {
    const row = await chatDB.settings.get(key);
    return row && isModelId(row.value) ? row.value : null;
  }

  async setSetting<K extends SettingKey>(key: K, value: SettingsMap[K]): Promise<void> {
    await chatDB.settings.put({ key, value });
  }
}
