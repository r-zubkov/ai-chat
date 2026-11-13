import { isChatRequestMessages, type ChatRequestMessage } from './messages.js';
import { isModelId, type ModelId } from './models/index.js';

export interface ChatCompletionRequest {
  model: ModelId;
  messages: ChatRequestMessage[];
}

export interface ChatCompletionResponse {
  content: string;
}

export type AvailableModelIdsResponse = ModelId[];

export function isChatCompletionRequest(value: unknown): value is ChatCompletionRequest {
  if (!isRecord(value)) return false;

  return isModelId(value['model']) && isChatRequestMessages(value['messages']);
}

export function isChatCompletionResponse(value: unknown): value is ChatCompletionResponse {
  return isRecord(value) && typeof value['content'] === 'string';
}

export function isAvailableModelIdsResponse(value: unknown): value is AvailableModelIdsResponse {
  return Array.isArray(value) && value.length > 0 && value.every(isModelId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
