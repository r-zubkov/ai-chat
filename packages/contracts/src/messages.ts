export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatRequestMessage {
  role: ChatRole;
  content: string;
}

const CHAT_ROLES = new Set<ChatRole>(['system', 'user', 'assistant']);

export function isChatRequestMessage(value: unknown): value is ChatRequestMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value['role'] === 'string' &&
    CHAT_ROLES.has(value['role'] as ChatRole) &&
    typeof value['content'] === 'string'
  );
}

export function isChatRequestMessages(value: unknown): value is ChatRequestMessage[] {
  return Array.isArray(value) && value.every(isChatRequestMessage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
