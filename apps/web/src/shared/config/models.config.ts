import {
  AVAILABLE_MODELS as AVAILABLE_MODEL_MAP,
  DEEPSEEK_MODELS,
  GEMINI_MODELS,
  GPT_MODELS,
  GROK_MODELS,
  isModelId,
  type ModelDefinition,
  type ModelId,
} from '@ai-chat/contracts';

export type ModelType = ModelId;

export const AVAILABLE_MODELS = Object.values(AVAILABLE_MODEL_MAP);
export type ModelOption = ModelDefinition;

export { DEEPSEEK_MODELS, GEMINI_MODELS, GPT_MODELS, GROK_MODELS };

export const isModelType = isModelId;

export const HISTORY_LIMIT: number = 6;
export const STREAM_PERSIST_INTERVAL: number = 3000;
