import type { ModelFamily } from './model.constants.js';
import type { ModelConfigInput } from './model.types.js';

type ModelConfigMap = Readonly<Record<string, ModelConfigInput>>;

type FamilyModelMap<TFamily extends ModelFamily, TModels extends ModelConfigMap> = {
  readonly [TKey in keyof TModels]: Readonly<TModels[TKey] & { family: TFamily }>;
};

export function defineFamilyModels<
  const TFamily extends ModelFamily,
  const TModels extends ModelConfigMap,
>(family: TFamily, models: TModels): FamilyModelMap<TFamily, TModels> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(models).map(([key, model]) => [key, Object.freeze({ ...model, family })]),
    ),
  ) as FamilyModelMap<TFamily, TModels>;
}
