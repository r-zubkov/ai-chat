import type { Adapter, ModelFamily } from './model.constants.js';

export interface ModelConfigInput {
  readonly id: string;
  readonly label: string;
}

export interface FamilyModelConfig extends ModelConfigInput {
  readonly family: ModelFamily;
}

export interface AvailableModelConfig extends FamilyModelConfig {
  readonly adapter: Adapter;
}

export interface AvailableModelGroup {
  readonly adapter: Adapter;
  readonly models: readonly FamilyModelConfig[];
}
