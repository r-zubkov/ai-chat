import type { Adapter, ChatRequestMessage, ModelId } from '@ai-chat/contracts';

export type InferenceMessage = ChatRequestMessage;

export interface InferenceRequest {
  model: ModelId;
  messages: readonly InferenceMessage[];
  signal: AbortSignal;
}

export type ChatStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done'; finishReason?: string };

export interface InferenceAdapter {
  readonly id: Adapter;
  stream(request: InferenceRequest): AsyncIterable<ChatStreamEvent>;
}
