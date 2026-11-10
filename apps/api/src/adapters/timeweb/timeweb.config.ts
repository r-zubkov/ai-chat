import { isModelId, type ModelId } from '@ai-chat/contracts';
import { config as loadDotenv } from 'dotenv';
import { basename, dirname, resolve } from 'node:path';

export interface TimewebConfig {
  readonly apiKey: string;
  readonly agentIds: ReadonlyMap<ModelId, string>;
}

export function loadTimewebConfig(source: NodeJS.ProcessEnv = process.env): TimewebConfig {
  if (source === process.env && source['ENV'] !== 'test') {
    loadDotenv({ path: resolveTimewebEnvironmentPath() });
  }

  return Object.freeze({
    apiKey: requiredEnvironmentValue(source, 'TIMEWEB_API_KEY'),
    agentIds: parseAgentIds(requiredEnvironmentValue(source, 'TIMEWEB_AGENT_IDS')),
  });
}

function parseAgentIds(serialized: string): ReadonlyMap<ModelId, string> {
  let value: unknown;

  try {
    value = JSON.parse(serialized) as unknown;
  } catch {
    throw new Error('Invalid TIMEWEB_AGENT_IDS: expected a JSON object');
  }

  if (!isRecord(value) || Object.keys(value).length === 0) {
    throw new Error('Invalid TIMEWEB_AGENT_IDS: expected a non-empty JSON object');
  }

  const agentIds = new Map<ModelId, string>();

  for (const [modelId, agentId] of Object.entries(value)) {
    if (!isModelId(modelId)) {
      throw new Error(`Unknown model in TIMEWEB_AGENT_IDS: ${modelId}`);
    }

    if (typeof agentId !== 'string' || !agentId.trim()) {
      throw new Error(`Invalid Timeweb agent ID for model: ${modelId}`);
    }

    agentIds.set(modelId, agentId.trim());
  }

  return agentIds;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
