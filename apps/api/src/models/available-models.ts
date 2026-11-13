import { KNOWN_MODELS, type ModelDefinition, type ModelId } from '@ai-chat/contracts';
import type { Adapter } from '../adapters/adapter.constants.js';

export type AvailableModelDefinition = ModelDefinition & {
  readonly adapter: Adapter;
};

export type AvailableModels = ReadonlyMap<ModelId, AvailableModelDefinition>;

interface AvailableModelGroup {
  readonly adapter: Adapter;
  readonly modelIds: readonly ModelId[];
}

export function createAvailableModels(groups: readonly AvailableModelGroup[]): AvailableModels {
  const adapterByModel = new Map<ModelId, Adapter>();

  for (const group of groups) {
    for (const modelId of group.modelIds) {
      if (adapterByModel.has(modelId)) {
        throw new Error(`Available model is registered more than once: ${modelId}`);
      }

      adapterByModel.set(modelId, group.adapter);
    }
  }

  const models = new Map<ModelId, AvailableModelDefinition>();

  for (const model of Object.values(KNOWN_MODELS)) {
    const adapter = adapterByModel.get(model.id);
    if (!adapter) continue;

    models.set(model.id, Object.freeze({ ...model, adapter }));
  }

  if (models.size === 0) {
    throw new Error('At least one available model must be configured');
  }

  return models;
}
