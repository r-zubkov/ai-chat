import {
  getModelDefinition,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
} from '@ai-chat/contracts';
import { InferenceAdapterRegistry } from '../adapters/inference-adapter-registry.js';
import { MODEL_FAMILY_SYSTEM_PROMPTS } from '../prompts/system-prompts.js';
import type { ChatStreamEvent, InferenceMessage } from './inference-adapter.js';

export class ChatService {
  constructor(private readonly adapters: InferenceAdapterRegistry) {}

  async *stream(
    request: ChatCompletionRequest,
    signal: AbortSignal,
  ): AsyncIterable<ChatStreamEvent> {
    const modelDefinition = getModelDefinition(request.model);
    const systemPrompt = MODEL_FAMILY_SYSTEM_PROMPTS[modelDefinition.family];
    const messages: readonly InferenceMessage[] = [
      { role: 'system', content: systemPrompt },
      ...request.messages,
    ];
    const adapter = this.adapters.get(modelDefinition.adapter);

    yield* adapter.stream({
      model: request.model,
      messages,
      signal,
    });
  }

  async complete(
    request: ChatCompletionRequest,
    signal: AbortSignal,
  ): Promise<ChatCompletionResponse> {
    let content = '';

    for await (const event of this.stream(request, signal)) {
      if (event.type === 'delta') content += event.content;
      if (event.type === 'done') break;
    }

    return { content };
  }
}
