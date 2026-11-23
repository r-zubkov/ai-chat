import { ChatState, toChatId } from '@entities/chat';
import { ChatMessageRole, ChatMessageState, toSequelId } from '@entities/message';
import { GPT_MODELS } from '@shared/config';
import { createChatEntity, createMessageEntity, generateSequelId } from './chat.helpers';

describe('chat.helpers', () => {
  it('generates sequelId from time and a local counter', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123);

    const sequelId = generateSequelId(7);

    expect(sequelId).toBe(toSequelId(123007));
  });

  it('creates a chat entity with default fields', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    const longName = `  ${'слово '.repeat(30)}  `;

    const chat = createChatEntity(longName, GPT_MODELS.GPT_5_1.id);

    expect(chat.id).toBeTruthy();
    expect(chat.title.length).toBeLessThanOrEqual(120);
    expect(chat.title.endsWith('…')).toBe(false);
    expect(chat.state).toBe(ChatState.IDLE);
    expect(chat.projectId).toBeNull();
    expect(chat.currentRequestId).toBeNull();
    expect(chat.model).toBe(GPT_MODELS.GPT_5_1.id);
    expect(chat.lastUpdate).toBe(1_000);
  });

  it('creates a message entity with an id and timestamp', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2_000);

    const message = createMessageEntity({
      chatId: toChatId('chat-1'),
      sequelId: toSequelId(10),
      role: ChatMessageRole.USER,
      model: GPT_MODELS.GPT_5_1.id,
      state: ChatMessageState.COMPLETED,
      content: 'Текст сообщения',
    });

    expect(message.id).toBeTruthy();
    expect(message.timestamp).toBe(2_000);
    expect(message.chatId).toBe(toChatId('chat-1'));
    expect(message.content).toBe('Текст сообщения');
  });
});
