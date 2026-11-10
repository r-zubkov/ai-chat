import { DEEPSEEK_MODELS } from './configs/deepseek.models.js';
import { GEMINI_MODELS } from './configs/gemini.models.js';
import { GPT_MODELS } from './configs/gpt.models.js';
import { GROK_MODELS } from './configs/grok.models.js';

const MODEL_CONFIGS = {
  ...GROK_MODELS,
  ...DEEPSEEK_MODELS,
  ...GEMINI_MODELS,
  ...GPT_MODELS,
} as const;

export type KnownModelDefinition = (typeof MODEL_CONFIGS)[keyof typeof MODEL_CONFIGS];
export type KnownModelId = KnownModelDefinition['id'];

type KnownModelMap = {
  readonly [TModel in KnownModelDefinition as TModel['id']]: TModel;
};

export const KNOWN_MODELS = Object.freeze(
  Object.fromEntries(Object.values(MODEL_CONFIGS).map((model) => [model.id, model])),
) as KnownModelMap;

export function getKnownModelDefinition(model: string): KnownModelDefinition | undefined {
  return KNOWN_MODELS[model as KnownModelId];
}
