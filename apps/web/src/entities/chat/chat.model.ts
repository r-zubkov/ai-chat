export type ChatId = string & { readonly __brand: 'ChatId' };

export function toChatId(raw: string): ChatId {
  return raw as ChatId;
}

export enum ChatState {
  IDLE = 'idle',
  THINKING = 'thinking',
  ERROR = 'error',
}

export function isChatState(value: string): value is ChatState {
  return Object.values<string>(ChatState).includes(value);
}

export interface Chat {
  readonly id: ChatId;
  title: string;
  state: ChatState;
  model: string;
  projectId: string | null;
  currentRequestId: string | null;
  lastUpdate: number;
}

export interface ChatStoreState {
  chats: Chat[];
  chatsCount: number;
  loadedChatsLimit: number;
  activeChatId: ChatId | null;
}
