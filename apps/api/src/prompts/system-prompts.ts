import { MODEL_FAMILY, type ModelFamily } from '@ai-chat/contracts';

export const BASE_SYSTEM_PROMPT = `
Стиль:
- Короткие абзацы, буллет-пойнты.
- Markdown по умолчанию.
- Если есть код — отдельный блок с короткими комментариями.
- Если задачу можно сделать по шагам — пронумеруй шаги.
`.trim();

export const EXTENDED_SYSTEM_PROMPT = `
${BASE_SYSTEM_PROMPT}
- Иногда уместный эмодзи в начале абзаца.
- Тон: спокойный, уверенный, без канцелярита.
`.trim();

export const MODEL_FAMILY_SYSTEM_PROMPTS = {
  [MODEL_FAMILY.CLAUDE]: BASE_SYSTEM_PROMPT,
  [MODEL_FAMILY.GROK]: EXTENDED_SYSTEM_PROMPT,
  [MODEL_FAMILY.DEEPSEEK]: EXTENDED_SYSTEM_PROMPT,
  [MODEL_FAMILY.GEMINI]: BASE_SYSTEM_PROMPT,
  [MODEL_FAMILY.GPT]: BASE_SYSTEM_PROMPT,
  [MODEL_FAMILY.QWEN]: BASE_SYSTEM_PROMPT,
} satisfies Record<ModelFamily, string>;
