import { CHAT_ERROR_CODE, type ChatErrorCode } from '@ai-chat/contracts';

export class ChatServiceError extends Error {
  constructor(
    readonly code: ChatErrorCode,
    message: string,
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ChatServiceError';
  }
}

export function normalizeChatError(error: unknown): ChatServiceError {
  if (error instanceof ChatServiceError) return error;

  return new ChatServiceError(CHAT_ERROR_CODE.INTERNAL_ERROR, 'Internal server error', 500, {
    cause: error,
  });
}
