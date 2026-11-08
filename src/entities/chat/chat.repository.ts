import { Injectable } from '@angular/core';
import { chatDB, ChatRecord } from '@shared/db';
import { DEFAULT_CHAT_LIST_LIMIT, isModelType } from '@shared/config';
import { Chat, ChatId, isChatState, toChatId } from './chat.model';

@Injectable({ providedIn: 'root' })
export class ChatRepository {
  async getAll(limit: number = DEFAULT_CHAT_LIST_LIMIT): Promise<Chat[]> {
    const rows = await chatDB.chats.orderBy('lastUpdate').reverse().limit(limit).toArray();
    return rows.map((row) => this.toDomain(row));
  }

  async getById(id: ChatId): Promise<Chat | null> {
    const row = await chatDB.chats.get(id);
    return row ? this.toDomain(row) : null;
  }

  async getCount(): Promise<number> {
    return chatDB.chats.count();
  }

  async create(chat: Chat): Promise<void> {
    await chatDB.chats.put(this.toRecord(chat));
  }

  async update(id: ChatId, data: Partial<Omit<Chat, 'id'>>): Promise<void> {
    await chatDB.chats.update(id, data);
  }

  async delete(id: ChatId): Promise<void> {
    await chatDB.transaction('rw', chatDB.chats, chatDB.messages, async () => {
      await chatDB.chats.delete(id);
      await chatDB.messages.where('chatId').equals(id).delete();
    });
  }

  async clear(): Promise<void> {
    await chatDB.transaction('rw', chatDB.chats, chatDB.messages, async () => {
      await chatDB.chats.clear();
      await chatDB.messages.clear();
    });
  }

  private toDomain(row: ChatRecord): Chat {
    if (!isChatState(row.state) || !isModelType(row.model)) {
      throw new Error(`Invalid chat record: ${row.id}`);
    }

    return {
      id: toChatId(row.id),
      title: row.title,
      state: row.state,
      model: row.model,
      projectId: row.projectId,
      currentRequestId: row.currentRequestId,
      lastUpdate: row.lastUpdate,
    };
  }

  private toRecord(chat: Chat): ChatRecord {
    return {
      ...chat,
      id: chat.id,
    };
  }
}
