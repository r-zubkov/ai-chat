import { toChatId } from '@entities/chat';
import {
  ChatMessage,
  ChatMessageRole,
  ChatMessageState,
  toMessageId,
  toSequelId,
} from '@entities/message';
import { GPT_MODELS, HISTORY_LIMIT } from '@shared/config';
import { buildApiMessages } from './chat-api.helpers';

describe('chat-api.helpers', () => {
  it('builds history in source order without adding a system message', () => {
    const history = Array.from({ length: HISTORY_LIMIT + 2 }, (_, index) =>
      createHistoryMessage({
        id: `history-${index}`,
        sequelId: index,
        role: index % 2 === 0 ? ChatMessageRole.USER : ChatMessageRole.ASSISTANT,
        state: index === HISTORY_LIMIT ? ChatMessageState.ERROR : ChatMessageState.COMPLETED,
        content: `Сообщение ${index}`,
      }),
    );
    const userMessage = createHistoryMessage({
      id: 'current-user',
      sequelId: 999,
      role: ChatMessageRole.USER,
      state: ChatMessageState.COMPLETED,
      content: 'Текущий вопрос',
    });

    const result = buildApiMessages(history, userMessage);

    expect(result[0]?.content).toBe('Сообщение 2');
    expect(result[result.length - 1]).toEqual({
      role: ChatMessageRole.USER,
      content: 'Текущий вопрос',
    });
    expect(result.some((item) => item.role === 'system')).toBeFalse();
    expect(result.some((item) => item.content === `Сообщение ${HISTORY_LIMIT}`)).toBeFalse();
  });
});

function createHistoryMessage(params: {
  id: string;
  sequelId: number;
  role: ChatMessageRole;
  state: ChatMessageState;
  content: string;
}): ChatMessage {
  return {
    id: toMessageId(params.id),
    chatId: toChatId('chat-1'),
    sequelId: toSequelId(params.sequelId),
    role: params.role,
    model: GPT_MODELS.GPT_5_1.id,
    state: params.state,
    content: params.content,
    timestamp: 1,
  };
}
