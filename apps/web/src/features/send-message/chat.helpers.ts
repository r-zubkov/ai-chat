import type { ModelId } from '@ai-chat/contracts';
import { Chat, ChatState, toChatId } from '@entities/chat';
import { ChatMessage, SortKey, toMessageId, toSortKey } from '@entities/message';
import { truncateAtWord } from '@shared/helpers';

export function generateSortKey(timestampMs: number, offset: number): SortKey {
  return toSortKey(timestampMs * 1000 + offset);
}

export function createChatEntity(name: string, model: ModelId): Chat {
  return {
    id: toChatId(crypto.randomUUID()),
    title: truncateAtWord(name, 120, null),
    state: ChatState.IDLE,
    model,
    projectId: null,
    currentRequestId: null,
    lastUpdate: Date.now(),
  };
}

export function createMessageEntity(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  return {
    ...msg,
    id: toMessageId(crypto.randomUUID()),
    timestamp: Date.now(),
  };
}
