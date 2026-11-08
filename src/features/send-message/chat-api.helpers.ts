import { ChatMessage, ChatMessageRole, ChatMessageState } from '@entities/message';
import { ModelType } from '@entities/settings';
import { ChatRequestMessage } from '@shared/api';
import { HISTORY_LIMIT } from '@shared/config';

export function applySystemPrompt(
  model: ModelType,
  messages: ChatRequestMessage[],
  modelSystemPrompts: Partial<Record<ModelType, string>>,
): ChatRequestMessage[] {
  const systemPrompt = modelSystemPrompts[model];
  if (!systemPrompt) return messages;

  const systemMessage: ChatRequestMessage = {
    role: ChatMessageRole.SYSTEM,
    content: systemPrompt,
  };

  return [systemMessage, ...messages];
}

export function buildApiMessages(
  messageHistory: ChatMessage[],
  userMessage: ChatMessage,
  model: ModelType,
  modelSystemPrompts: Partial<Record<ModelType, string>>,
): ChatRequestMessage[] {
  const historyTail = messageHistory
    .slice(-HISTORY_LIMIT)
    .filter((message) => message.state !== ChatMessageState.ERROR)
    .map<ChatRequestMessage>((message) => ({
      role: message.role,
      content: message.content,
    }));

  const lastUserMessage: ChatRequestMessage = {
    role: userMessage.role,
    content: userMessage.content,
  };

  const historyWithLastUserMsg: ChatRequestMessage[] = [...historyTail, lastUserMessage];

  return applySystemPrompt(model, historyWithLastUserMsg, modelSystemPrompts);
}
