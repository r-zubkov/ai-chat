import Dexie, { Table } from 'dexie';

export interface ProjectRecord {
  id: string;
  name: string;
  lastUpdate: number;
}

export interface ChatRecord {
  id: string;
  title: string;
  state: string;
  model: string;
  projectId: string | null;
  currentRequestId: string | null;
  lastUpdate: number;
}

export interface MessageRecord {
  id: string;
  chatId: string;
  sortKey: number;
  role: string;
  model: string;
  state: string;
  content: string;
  timestamp: number;
}

export interface SettingRecord {
  key: string;
  value: string;
}

export class ChatDb extends Dexie {
  projects!: Table<ProjectRecord, string>;
  chats!: Table<ChatRecord, string>;
  messages!: Table<MessageRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('ai-chat-db');

    this.version(1).stores({
      projects: 'id, lastUpdate',
      chats: 'id, projectId, lastUpdate',
      messages: 'id, sequelId, chatId, timestamp, [chatId+sequelId]',
      settings: 'key',
    });

    this.version(2)
      .stores({ messages: 'id, sortKey, chatId, timestamp, [chatId+sortKey]' })
      .upgrade((transaction) =>
        transaction
          .table<{ timestamp: number; sequelId?: number; sortKey?: number }, string>('messages')
          .toCollection()
          .modify((message) => {
            message.sortKey = message.sequelId ?? message.timestamp * 1000;
            delete message.sequelId;
          }),
      );
  }
}

export const chatDB = new ChatDb();
