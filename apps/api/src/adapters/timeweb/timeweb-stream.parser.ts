import { CHAT_ERROR_CODE } from '@ai-chat/contracts';
import { ChatServiceError } from '../../chat/chat.error.js';
import type { ChatStreamEvent } from '../../chat/inference-adapter.js';

export async function* parseTimewebStream(
  chunks: AsyncIterable<Uint8Array | string>,
): AsyncGenerator<ChatStreamEvent> {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  for await (const chunk of chunks) {
    buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const event = parseLine(line);
      if (!event) continue;
      yield event;
      if (event.type === 'done') return;
    }
  }

  buffer += decoder.decode();
  if (buffer.length > 0) {
    const event = parseLine(buffer);
    if (event) {
      yield event;
      if (event.type === 'done') return;
    }
  }

  yield { type: 'done' };
}

function parseLine(line: string): ChatStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;

  const data = trimmed.replace(/^data:\s*/, '');
  if (!data) return null;
  if (data === '[DONE]') return { type: 'done' };

  let payload: unknown;
  try {
    payload = JSON.parse(data) as unknown;
  } catch (error: unknown) {
    throw new ChatServiceError(
      CHAT_ERROR_CODE.PROVIDER_ERROR,
      'Provider returned an invalid stream payload',
      502,
      { cause: error },
    );
  }

  const content = readContent(payload);
  return content ? { type: 'delta', content } : null;
}

function readContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload['choices'])) return '';

  const choices = payload['choices'] as unknown[];
  const choice = choices[0];
  if (!isRecord(choice)) return '';

  const delta = choice['delta'];
  if (isRecord(delta) && typeof delta['content'] === 'string') return delta['content'];

  const message = choice['message'];
  return isRecord(message) && typeof message['content'] === 'string' ? message['content'] : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
