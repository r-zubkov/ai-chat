import { getKnownModelDefinition } from '@ai-chat/contracts';

export function getModelLabelByKey(key: string): string {
  return getKnownModelDefinition(key)?.label ?? 'Модель';
}
