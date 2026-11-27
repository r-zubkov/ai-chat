import type { ModelId } from '@ai-chat/contracts';

export type { ModelOption } from '@shared/config';

export enum SettingKey {
  CURRENT_MODEL = 'current-model',
}

export type SettingValue = ModelId;

export interface SettingsMap {
  [SettingKey.CURRENT_MODEL]: ModelId;
}

export type Setting = {
  [K in SettingKey]: {
    key: K;
    value: SettingsMap[K];
  };
}[SettingKey];
