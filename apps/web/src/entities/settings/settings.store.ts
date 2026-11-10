import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { ModelOption, ModelType } from '@shared/config';
import { SettingsRepository } from './settings.repository';
import { SettingKey } from './settings.model';

type SettingsStoreState = {
  currentModel: ModelType | null;
  globalCurrentModel: ModelType | null;
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<SettingsStoreState>({
    currentModel: null,
    globalCurrentModel: null,
  }),
  withMethods((store, settingsRepository = inject(SettingsRepository)) => ({
    async loadSettings(availableModels: readonly ModelOption[]): Promise<void> {
      const fallback = availableModels[0]?.id;
      if (!fallback) throw new Error('No available models are loaded');

      const loaded = await settingsRepository.getSetting(SettingKey.CURRENT_MODEL);
      const model = availableModels.some((item) => item.id === loaded) ? loaded : fallback;

      patchState(store, {
        currentModel: model,
        globalCurrentModel: model,
      });
    },
    async reconcileAvailableModels(availableModels: readonly ModelOption[]): Promise<void> {
      const fallback = availableModels[0]?.id;
      if (!fallback) throw new Error('No available models are loaded');

      const isAvailable = (model: ModelType | null): model is ModelType =>
        model !== null && availableModels.some((item) => item.id === model);
      const currentModel = store.currentModel();
      const globalCurrentModel = store.globalCurrentModel();
      const nextGlobalModel = isAvailable(globalCurrentModel) ? globalCurrentModel : fallback;
      const nextCurrentModel = isAvailable(currentModel) ? currentModel : nextGlobalModel;

      patchState(store, {
        currentModel: nextCurrentModel,
        globalCurrentModel: nextGlobalModel,
      });

      if (globalCurrentModel !== nextGlobalModel) {
        await settingsRepository.setSetting(SettingKey.CURRENT_MODEL, nextGlobalModel);
      }
    },
    setCurrentModel(model: ModelType): void {
      patchState(store, { currentModel: model });
    },
    setGlobalCurrentModel(model: ModelType): void {
      patchState(store, { globalCurrentModel: model });
    },
    async persistGlobalModel(model: ModelType): Promise<void> {
      patchState(store, { globalCurrentModel: model });
      await settingsRepository.setSetting(SettingKey.CURRENT_MODEL, model);
    },
  })),
);
