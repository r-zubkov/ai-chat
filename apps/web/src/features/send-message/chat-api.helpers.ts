import { ChatMessage, ChatMessageState } from '@entities/message';
import { ChatRequestMessage } from '@shared/api';
import { HISTORY_LIMIT } from '@shared/config';

export function buildApiMessages(
  messageHistory: ChatMessage[],
  userMessage: ChatMessage,
): ChatRequestMessage[] {
  const historyTail = messageHistory
    .slice(-HISTORY_LIMIT)
    .filter((message) => message.state !== ChatMessageState.ERROR)
    .map<ChatRequestMessage>((message) => ({
      role: message.role,
      content: message.content,
    }));

  return [
    ...historyTail,
    {
      role: userMessage.role,
      content: userMessage.content,
    },
  ];
}
