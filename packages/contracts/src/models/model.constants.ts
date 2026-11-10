export const ADAPTER = {
  TIMEWEB: 'timeweb',
} as const;

export type Adapter = (typeof ADAPTER)[keyof typeof ADAPTER];

export const MODEL_FAMILY = {
  GROK: 'grok',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini',
  GPT: 'gpt',
} as const;

export type ModelFamily = (typeof MODEL_FAMILY)[keyof typeof MODEL_FAMILY];
