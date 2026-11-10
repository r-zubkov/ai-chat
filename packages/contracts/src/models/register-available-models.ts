import type { Adapter } from './model.constants.js';
import type {
  AvailableModelConfig,
  AvailableModelGroup,
  FamilyModelConfig,
} from './model.types.js';

type RegisteredModel<TGroup> = TGroup extends {
  readonly adapter: infer TAdapter extends Adapter;
  readonly models: infer TModels extends readonly FamilyModelConfig[];
}
  ? TModels[number] & { readonly adapter: TAdapter }
  : never;

type AvailableModelMap<TGroups extends readonly AvailableModelGroup[]> = {
  readonly [TModel in RegisteredModel<TGroups[number]> as TModel['id']]: Readonly<TModel>;
};

export function registerAvailableModels<const TGroups extends readonly AvailableModelGroup[]>(
  groups: TGroups,
): AvailableModelMap<TGroups> {
  const models: Record<string, AvailableModelConfig> = {};

  for (const group of groups) {
    for (const model of group.models) {
      if (Object.hasOwn(models, model.id)) {
        throw new Error(`Available model is registered more than once: ${model.id}`);
      }

      models[model.id] = Object.freeze({ ...model, adapter: group.adapter });
    }
  }

  return Object.freeze(models) as AvailableModelMap<TGroups>;
}
