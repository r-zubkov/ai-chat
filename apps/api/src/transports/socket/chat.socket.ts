import {
  CHAT_ERROR_CODE,
  SOCKET_EVENTS,
  isChatAbortPayload,
  isChatRequestPayload,
  isModelId,
  isRequestId,
  type ChatErrorPayload,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@ai-chat/contracts';
import type { Server, Socket } from 'socket.io';
import { ChatServiceError, normalizeChatError } from '../../chat/chat.error.js';
import type { ChatService } from '../../chat/chat.service.js';

interface ActiveRequest {
  readonly controller: AbortController;
  settled: boolean;
}

type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerChatSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  chatService: ChatService,
): void {
  io.on('connection', (socket) => registerSocketHandlers(socket, chatService));
}

function registerSocketHandlers(socket: ChatSocket, chatService: ChatService): void {
  const activeRequests = new Map<string, ActiveRequest>();

  socket.on('disconnect', () => {
    for (const request of activeRequests.values()) {
      request.settled = true;
      request.controller.abort();
    }
    activeRequests.clear();
  });

  socket.on(SOCKET_EVENTS.abort, (payload: unknown) => {
    if (!isChatAbortPayload(payload)) return;

    const active = activeRequests.get(payload.requestId);
    if (!active) return;

    active.controller.abort();
    finish(activeRequests, socket, payload.requestId, active, true);
  });

  socket.on(SOCKET_EVENTS.request, (payload: unknown) => {
    const requestId = readRequestId(payload);
    if (!isChatRequestPayload(payload)) {
      const error = classifyInvalidRequest(payload, requestId);
      socket.emit(SOCKET_EVENTS.error, toPublicError(error, requestId));
      return;
    }

    if (activeRequests.has(payload.requestId)) {
      socket.emit(SOCKET_EVENTS.error, {
        requestId: payload.requestId,
        code: CHAT_ERROR_CODE.INVALID_REQUEST,
        message: 'A request with this identifier is already running',
      });
      return;
    }

    const active: ActiveRequest = { controller: new AbortController(), settled: false };
    activeRequests.set(payload.requestId, active);
    void streamRequest(socket, chatService, activeRequests, payload, active);
  });
}

async function streamRequest(
  socket: ChatSocket,
  chatService: ChatService,
  activeRequests: Map<string, ActiveRequest>,
  payload: Parameters<ClientToServerEvents[typeof SOCKET_EVENTS.request]>[0],
  active: ActiveRequest,
): Promise<void> {
  try {
    for await (const event of chatService.stream(payload, active.controller.signal)) {
      if (active.settled || !socket.connected) return;

      if (event.type === 'delta') {
        socket.emit(SOCKET_EVENTS.chunk, {
          requestId: payload.requestId,
          delta: event.content,
        });
      }

      if (event.type === 'done') {
        finish(activeRequests, socket, payload.requestId, active, false);
        return;
      }
    }

    finish(activeRequests, socket, payload.requestId, active, false);
  } catch (error: unknown) {
    if (active.controller.signal.aborted || active.settled || !socket.connected) return;

    const normalized = normalizeChatError(error);
    if (normalized.code === CHAT_ERROR_CODE.INTERNAL_ERROR) {
      console.error('Socket chat request failed', normalized.cause ?? normalized);
    }
    active.settled = true;
    socket.emit(SOCKET_EVENTS.error, toPublicError(normalized, payload.requestId));
  } finally {
    if (activeRequests.get(payload.requestId) === active) {
      activeRequests.delete(payload.requestId);
    }
  }
}

function finish(
  activeRequests: Map<string, ActiveRequest>,
  socket: ChatSocket,
  requestId: string,
  active: ActiveRequest,
  aborted: boolean,
): void {
  if (active.settled) return;

  active.settled = true;
  activeRequests.delete(requestId);
  if (socket.connected) socket.emit(SOCKET_EVENTS.done, { requestId, aborted });
}

function classifyInvalidRequest(value: unknown, requestId?: string): ChatServiceError {
  if (isRecord(value) && typeof value['model'] === 'string' && !isModelId(value['model'])) {
    return new ChatServiceError(CHAT_ERROR_CODE.UNKNOWN_MODEL, 'Unknown model', 400);
  }

  return new ChatServiceError(
    CHAT_ERROR_CODE.INVALID_REQUEST,
    requestId ? 'Invalid request' : 'Invalid requestId',
    400,
  );
}

function readRequestId(value: unknown): string | undefined {
  return isRecord(value) && isRequestId(value['requestId']) ? value['requestId'] : undefined;
}

function toPublicError(error: ChatServiceError, requestId?: string): ChatErrorPayload {
  return {
    ...(requestId ? { requestId } : {}),
    code: error.code,
    message: getPublicMessage(error),
  };
}

function getPublicMessage(error: ChatServiceError): string {
  if (error.code === CHAT_ERROR_CODE.PROVIDER_ERROR) return 'Model service is unavailable';
  if (error.code === CHAT_ERROR_CODE.INTERNAL_ERROR) return 'Internal server error';
  return error.message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
