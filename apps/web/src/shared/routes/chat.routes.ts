export const CHAT_ROUTE_SEGMENTS = {
  root: 'chats',
  new: 'new',
  id: ':id',
} as const;

export const CHAT_ROUTES = {
  root: `/${CHAT_ROUTE_SEGMENTS.root}`,
  new: `/${CHAT_ROUTE_SEGMENTS.root}/${CHAT_ROUTE_SEGMENTS.new}`,
  byId: (chatId: string): string => `/${CHAT_ROUTE_SEGMENTS.root}/${encodeURIComponent(chatId)}`,
} as const;
