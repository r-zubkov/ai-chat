import type { ModelFamily } from './model.constants.js';

export interface ModelConfigInput {
  readonly id: string;
  readonly label: string;
}

export interface FamilyModelConfig extends ModelConfigInput {
  readonly family: ModelFamily;
}
