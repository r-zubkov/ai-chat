import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { getModelDefinition, type ModelId } from '@ai-chat/contracts';
import type { ModelOption } from '@shared/config';
import { ModelRepository } from './model.repository';

interface ModelStoreState {
  readonly models: readonly ModelOption[];
}

const initialState: ModelStoreState = {
  models: [],
};

export const ModelStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, modelRepository = inject(ModelRepository)) => ({
    restoreCachedModels(): readonly ModelOption[] | null {
      const modelIds = modelRepository.getCachedAvailableModelIds();
      if (!modelIds) return null;

      const models = modelIds.map(getModelDefinition);
      patchState(store, { models });
      return models;
    },
    async refreshAvailableModels(): Promise<readonly ModelOption[]> {
      const modelIds = await modelRepository.getAvailableModelIds();
      const models = modelIds.map(getModelDefinition);
      patchState(store, { models });
      modelRepository.cacheAvailableModelIds(modelIds);
      return models;
    },
    isAvailable(model: string): model is ModelId {
      return store.models().some((item) => item.id === model);
    },
    getDefaultModel(): ModelId {
      const model = store.models()[0];
      if (!model) throw new Error('No available models are loaded');
      return model.id;
    },
  })),
);
