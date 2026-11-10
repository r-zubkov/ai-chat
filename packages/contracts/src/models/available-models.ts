import { DEEPSEEK_MODELS } from './configs/deepseek.models.js';
import { GEMINI_MODELS } from './configs/gemini.models.js';
import { GPT_MODELS } from './configs/gpt.models.js';
import { GROK_MODELS } from './configs/grok.models.js';
import { ADAPTER } from './model.constants.js';
import { registerAvailableModels } from './register-available-models.js';

export const AVAILABLE_MODELS = registerAvailableModels([
  {
    adapter: ADAPTER.TIMEWEB,
    models: [
      GROK_MODELS.GROK_4_FAST,
      DEEPSEEK_MODELS.DEEPSEEK_V_3_2,
      GEMINI_MODELS.GEMINI_3_FLASH_PREVIEW,
      GPT_MODELS.GPT_5_1,
    ],
  },
] as const);

export type ModelId = keyof typeof AVAILABLE_MODELS;
export type ModelDefinition = (typeof AVAILABLE_MODELS)[ModelId];

export function isModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && Object.hasOwn(AVAILABLE_MODELS, value);
}

export function getModelDefinition(model: ModelId): ModelDefinition {
  return AVAILABLE_MODELS[model];
}
