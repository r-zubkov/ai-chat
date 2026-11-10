export const MODEL_FAMILY = {
  CLAUDE: 'claude',
  GROK: 'grok',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini',
  GPT: 'gpt',
  QWEN: 'qwen',
} as const;

export type ModelFamily = (typeof MODEL_FAMILY)[keyof typeof MODEL_FAMILY];
