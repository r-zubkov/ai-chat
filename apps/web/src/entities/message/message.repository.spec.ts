/** @jest-environment node */
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import type { ChatId } from '@entities/chat';
import { chatDB } from '@shared/db';
import { MessageRepository } from './message.repository';

describe('MessageRepository legacy history', () => {
  const chatId = 'chat' as ChatId;

  afterEach(async () => {
    await chatDB.delete({ disableAutoOpen: false });
  });

  it('loads chronological history after upgrading from version 1', async () => {
    const legacy = new Dexie(chatDB.name);
    legacy.version(1).stores({
      projects: 'id, lastUpdate',
      chats: 'id, projectId, lastUpdate',
      messages: 'id, sequelId, chatId, timestamp, [chatId+sequelId]',
      settings: 'key',
    });

    const message = {
      chatId,
      role: 'user',
      state: 'completed',
      model: 'gpt-5.1',
      content: 'Text',
    };
    try {
      await legacy.table('messages').bulkAdd([
        { ...message, id: 'a-last', timestamp: 2 },
        { ...message, id: 'z-first', timestamp: 1 },
        { ...message, id: 'keyed', timestamp: 1, sequelId: 1001 },
        { ...message, id: 'other-chat', chatId: 'other-chat', timestamp: 1 },
      ]);
    } finally {
      legacy.close();
    }

    const messages = await new MessageRepository().getMessagesByChatId(chatId);

    expect(chatDB.verno).toBe(2);
    expect(await chatDB.messages.get('keyed')).not.toHaveProperty('sequelId');
    expect(messages.map(({ id, sortKey }) => [id, sortKey])).toEqual([
      ['z-first', 1000],
      ['keyed', 1001],
      ['a-last', 2000],
    ]);
  });
});
