import type { ChatErrorPayload } from './errors.js';
import { isChatCompletionRequest, type ChatCompletionRequest } from './http.js';

export const SOCKET_EVENTS = {
  request: 'chat:request',
  abort: 'chat:abort',
  chunk: 'chat:chunk',
  done: 'chat:done',
  error: 'chat:error',
} as const;

export interface ChatRequestPayload extends ChatCompletionRequest {
  requestId: string;
}

export interface ChatAbortPayload {
  requestId: string;
}

export interface ChatChunkPayload {
  requestId: string;
  delta: string;
}

export interface ChatDonePayload {
  requestId: string;
  aborted: boolean;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.chunk]: (payload: ChatChunkPayload) => void;
  [SOCKET_EVENTS.done]: (payload: ChatDonePayload) => void;
  [SOCKET_EVENTS.error]: (payload: ChatErrorPayload) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.request]: (payload: ChatRequestPayload) => void;
  [SOCKET_EVENTS.abort]: (payload: ChatAbortPayload) => void;
}

export function isChatRequestPayload(value: unknown): value is ChatRequestPayload {
  return isRecord(value) && isRequestId(value['requestId']) && isChatCompletionRequest(value);
}

export function isChatAbortPayload(value: unknown): value is ChatAbortPayload {
  return isRecord(value) && isRequestId(value['requestId']);
}

export function isRequestId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
