import type { ChatId } from '@entities/chat';

export type MessageId = string & { readonly __brand: 'MessageId' };
export type SortKey = number & { readonly __brand: 'SortKey' };

export function toMessageId(raw: string): MessageId {
  return raw as MessageId;
}

export function toSortKey(raw: number): SortKey {
  return raw as SortKey;
}

export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export function isChatMessageRole(value: string): value is ChatMessageRole {
  return Object.values<string>(ChatMessageRole).includes(value);
}

export enum ChatMessageState {
  STREAMING = 'streaming',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export function isChatMessageState(value: string): value is ChatMessageState {
  return Object.values<string>(ChatMessageState).includes(value);
}

export interface ChatMessage {
  readonly id: MessageId;
  chatId: ChatId;
  sortKey: SortKey;
  role: ChatMessageRole;
  model: string;
  state: ChatMessageState;
  content: string;
  timestamp: number;
}
