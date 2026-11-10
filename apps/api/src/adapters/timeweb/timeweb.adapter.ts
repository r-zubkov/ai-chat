import { ADAPTER, CHAT_ERROR_CODE } from '@ai-chat/contracts';
import { ChatServiceError } from '../../chat/chat.error.js';
import type {
  ChatStreamEvent,
  InferenceAdapter,
  InferenceRequest,
} from '../../chat/inference-adapter.js';
import { parseTimewebStream } from './timeweb-stream.parser.js';
import { loadTimewebConfig, type TimewebConfig } from './timeweb.config.js';

const TIMEWEB_BASE_URL = 'https://api.timeweb.cloud/api/v1/cloud-ai/agents';

export class TimewebAdapter implements InferenceAdapter {
  readonly id = ADAPTER.TIMEWEB;

  constructor(
    private readonly config: TimewebConfig,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  async *stream(request: InferenceRequest): AsyncIterable<ChatStreamEvent> {
    const agentId = this.config.agentIds[request.model];

    let response: Response;

    try {
      response = await this.fetchImplementation(
        `${TIMEWEB_BASE_URL}/${agentId}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            stream: true,
          }),
          signal: request.signal,
        },
      );
    } catch (error: unknown) {
      if (request.signal.aborted) throw error;
      throw new ChatServiceError(CHAT_ERROR_CODE.PROVIDER_ERROR, 'Provider request failed', 502, {
        cause: error,
      });
    }

    if (!response.ok) {
      const providerBody = await response.text().catch(() => '');
      console.error('Timeweb API error', { status: response.status, body: providerBody });
      throw new ChatServiceError(CHAT_ERROR_CODE.PROVIDER_ERROR, 'Provider request failed', 502);
    }

    if (!response.body) {
      throw new ChatServiceError(
        CHAT_ERROR_CODE.PROVIDER_ERROR,
        'Provider returned an empty response body',
        502,
      );
    }

    try {
      yield* parseTimewebStream(readResponseBody(response.body));
    } catch (error: unknown) {
      if (request.signal.aborted || error instanceof ChatServiceError) throw error;
      throw new ChatServiceError(CHAT_ERROR_CODE.PROVIDER_ERROR, 'Provider stream failed', 502, {
        cause: error,
      });
    }
  }
}

export function createTimewebAdapter(
  source: NodeJS.ProcessEnv = process.env,
  fetchImplementation: typeof fetch = fetch,
): TimewebAdapter {
  return new TimewebAdapter(loadTimewebConfig(source), fetchImplementation);
}

async function* readResponseBody(body: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const reader = body.getReader();
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) return;
      yield result.value;
    }
  } finally {
    reader.releaseLock();
  }
}
