export const CHAT_ERROR_CODE = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN_MODEL: 'UNKNOWN_MODEL',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODE)[keyof typeof CHAT_ERROR_CODE];

export interface ChatErrorPayload {
  requestId?: string;
  code: ChatErrorCode;
  message: string;
}

const CHAT_ERROR_CODES = new Set<ChatErrorCode>(Object.values(CHAT_ERROR_CODE));

export function isChatErrorPayload(value: unknown): value is ChatErrorPayload {
  if (!isRecord(value)) return false;

  const requestId = value['requestId'];

  return (
    (requestId === undefined || typeof requestId === 'string') &&
    typeof value['code'] === 'string' &&
    CHAT_ERROR_CODES.has(value['code'] as ChatErrorCode) &&
    typeof value['message'] === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
