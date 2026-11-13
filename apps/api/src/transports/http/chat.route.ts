import {
  API_ROUTES,
  CHAT_ERROR_CODE,
  isChatCompletionRequest,
  isModelId,
  type ChatErrorPayload,
} from '@ai-chat/contracts';
import type { Express, Request, Response } from 'express';
import { ChatServiceError, normalizeChatError } from '../../chat/chat.error.js';
import type { ChatService } from '../../chat/chat.service.js';

export function registerChatRoute(app: Express, chatService: ChatService): void {
  app.post(API_ROUTES.chat, (request: Request, response: Response) => {
    void handleChatRequest(request, response, chatService);
  });
}

async function handleChatRequest(
  request: Request,
  response: Response,
  chatService: ChatService,
): Promise<void> {
  if (!isChatCompletionRequest(request.body)) {
    const error = classifyInvalidRequest(request.body);
    response.status(error.status).json(toPublicError(error));
    return;
  }

  const controller = new AbortController();
  request.once('aborted', () => controller.abort());

  try {
    response.json(await chatService.complete(request.body, controller.signal));
  } catch (error: unknown) {
    const normalized = normalizeChatError(error);
    if (normalized.code === CHAT_ERROR_CODE.INTERNAL_ERROR) {
      console.error('HTTP chat request failed', normalized.cause ?? normalized);
    }
    response.status(normalized.status).json(toPublicError(normalized));
  }
}

function classifyInvalidRequest(value: unknown): ChatServiceError {
  if (isRecord(value) && typeof value['model'] === 'string' && !isModelId(value['model'])) {
    return new ChatServiceError(CHAT_ERROR_CODE.UNKNOWN_MODEL, 'Unknown model', 400);
  }

  return new ChatServiceError(CHAT_ERROR_CODE.INVALID_REQUEST, 'Invalid request', 400);
}

function toPublicError(error: ChatServiceError): ChatErrorPayload {
  return { code: error.code, message: getPublicMessage(error) };
}

function getPublicMessage(error: ChatServiceError): string {
  if (error.code === CHAT_ERROR_CODE.PROVIDER_ERROR) return 'Model service is unavailable';
  if (error.code === CHAT_ERROR_CODE.INTERNAL_ERROR) return 'Internal server error';
  return error.message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
