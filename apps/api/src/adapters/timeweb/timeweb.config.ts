import {
  DEEPSEEK_MODELS,
  GEMINI_MODELS,
  GPT_MODELS,
  GROK_MODELS,
  type ModelId,
} from '@ai-chat/contracts';
import { config as loadDotenv } from 'dotenv';
import { basename, dirname, resolve } from 'node:path';

const TIMEWEB_AGENT_ENVIRONMENT_KEYS = {
  [GROK_MODELS.GROK_4_FAST.id]: 'TIMEWEB_AGENT_GROK_4_FAST_ID',
  [DEEPSEEK_MODELS.DEEPSEEK_V_3_2.id]: 'TIMEWEB_AGENT_DEEPSEEK_V3_2_ID',
  [GEMINI_MODELS.GEMINI_3_FLASH_PREVIEW.id]: 'TIMEWEB_AGENT_GEMINI_3_FLASH_PREVIEW_ID',
  [GPT_MODELS.GPT_5_1.id]: 'TIMEWEB_AGENT_GPT_5_1_ID',
} as const satisfies Record<ModelId, string>;

export interface TimewebConfig {
  readonly apiKey: string;
  readonly agentIds: Readonly<Record<ModelId, string>>;
}

export function loadTimewebConfig(source: NodeJS.ProcessEnv = process.env): TimewebConfig {
  if (source === process.env && source['ENV'] !== 'test') {
    loadDotenv({ path: resolveTimewebEnvironmentPath() });
  }

  const agentIds = Object.fromEntries(
    Object.entries(TIMEWEB_AGENT_ENVIRONMENT_KEYS).map(([modelId, environmentKey]) => [
      modelId,
      requiredEnvironmentValue(source, environmentKey),
    ]),
  ) as Record<ModelId, string>;

  return Object.freeze({
    apiKey: requiredEnvironmentValue(source, 'TIMEWEB_API_KEY'),
    agentIds: Object.freeze(agentIds),
  });
}

function resolveTimewebEnvironmentPath(): string {
  const workingDirectory = process.cwd();
  const apiWorkspace =
    basename(workingDirectory) === 'api' && basename(dirname(workingDirectory)) === 'apps'
      ? workingDirectory
      : resolve(workingDirectory, 'apps/api');

  return resolve(apiWorkspace, 'src/adapters/timeweb/.env');
}

function requiredEnvironmentValue(source: NodeJS.ProcessEnv, key: string): string {
  const value = source[key]?.trim();
  if (!value) throw new Error(`Missing required Timeweb environment variable: ${key}`);
  return value;
}
