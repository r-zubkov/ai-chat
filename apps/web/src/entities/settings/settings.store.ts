import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { ModelId } from '@ai-chat/contracts';
import type { ModelOption } from '@shared/config';
import { SettingsRepository } from './settings.repository';
import { SettingKey } from './settings.model';

type SettingsStoreState = {
  selectedModelId: ModelId | null;
  preferredModelId: ModelId | null;
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<SettingsStoreState>({
    selectedModelId: null,
    preferredModelId: null,
  }),
  withMethods((store, settingsRepository = inject(SettingsRepository)) => ({
    async loadSettings(availableModels: readonly ModelOption[]): Promise<void> {
      const fallback = availableModels[0]?.id;
      if (!fallback) throw new Error('No available models are loaded');

      const loaded = await settingsRepository.getSetting(SettingKey.CURRENT_MODEL);
      const model = availableModels.some((item) => item.id === loaded) ? loaded : fallback;

      patchState(store, {
        selectedModelId: model,
        preferredModelId: model,
      });
    },
    async reconcileAvailableModels(availableModels: readonly ModelOption[]): Promise<void> {
      const fallback = availableModels[0]?.id;
      if (!fallback) throw new Error('No available models are loaded');

      const isAvailable = (model: ModelId | null): model is ModelId =>
        model !== null && availableModels.some((item) => item.id === model);
      const selectedModelId = store.selectedModelId();
      const preferredModelId = store.preferredModelId();
      const nextPreferredModelId = isAvailable(preferredModelId) ? preferredModelId : fallback;
      const nextSelectedModelId = isAvailable(selectedModelId)
        ? selectedModelId
        : nextPreferredModelId;

      patchState(store, {
        selectedModelId: nextSelectedModelId,
        preferredModelId: nextPreferredModelId,
      });

      if (preferredModelId !== nextPreferredModelId) {
        await settingsRepository.setSetting(SettingKey.CURRENT_MODEL, nextPreferredModelId);
      }
    },
    setSelectedModelId(model: ModelId): void {
      patchState(store, { selectedModelId: model });
    },
    setPreferredModelId(model: ModelId): void {
      patchState(store, { preferredModelId: model });
    },
    async persistPreferredModelId(model: ModelId): Promise<void> {
      patchState(store, { preferredModelId: model });
      await settingsRepository.setSetting(SettingKey.CURRENT_MODEL, model);
    },
  })),
);
