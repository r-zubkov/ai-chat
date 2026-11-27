import {
  DEEPSEEK_MODELS,
  GEMINI_MODELS,
  GPT_MODELS,
  GROK_MODELS,
  type ModelDefinition,
} from '@ai-chat/contracts';

export type ModelOption = ModelDefinition;

export { DEEPSEEK_MODELS, GEMINI_MODELS, GPT_MODELS, GROK_MODELS };

export const HISTORY_LIMIT: number = 6;
export const STREAM_PERSIST_INTERVAL: number = 3000;
