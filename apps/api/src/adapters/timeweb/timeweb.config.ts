import { isModelId, type ModelId } from '@ai-chat/contracts';
import type { AdapterEnvironment } from '../adapter-environment.js';

const API_KEY_ENVIRONMENT_KEY = 'AI_CHAT_TIMEWEB_API_KEY';
const AGENT_IDS_ENVIRONMENT_KEY = 'AI_CHAT_TIMEWEB_AGENT_IDS';

export interface TimewebConfig {
  readonly apiKey: string;
  readonly agentIds: ReadonlyMap<ModelId, string>;
}

export function loadTimewebConfig(source: AdapterEnvironment): TimewebConfig {
  return Object.freeze({
    apiKey: requiredEnvironmentValue(source, API_KEY_ENVIRONMENT_KEY),
    agentIds: parseAgentIds(requiredEnvironmentValue(source, AGENT_IDS_ENVIRONMENT_KEY)),
  });
}

function parseAgentIds(serialized: string): ReadonlyMap<ModelId, string> {
  let value: unknown;

  try {
    value = JSON.parse(serialized) as unknown;
  } catch {
    throw new Error(`Invalid ${AGENT_IDS_ENVIRONMENT_KEY}: expected a JSON object`);
  }

  if (!isRecord(value) || Object.keys(value).length === 0) {
    throw new Error(`Invalid ${AGENT_IDS_ENVIRONMENT_KEY}: expected a non-empty JSON object`);
  }

  const agentIds = new Map<ModelId, string>();

  for (const [modelId, agentId] of Object.entries(value)) {
    if (!isModelId(modelId)) {
      throw new Error(`Unknown model in ${AGENT_IDS_ENVIRONMENT_KEY}: ${modelId}`);
    }

    if (typeof agentId !== 'string' || !agentId.trim()) {
      throw new Error(`Invalid Timeweb agent ID for model: ${modelId}`);
    }

    agentIds.set(modelId, agentId.trim());
  }

  return agentIds;
}

function requiredEnvironmentValue(source: AdapterEnvironment, key: string): string {
  const value = source[key]?.trim();
  if (!value) throw new Error(`Missing required Timeweb environment variable: ${key}`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
