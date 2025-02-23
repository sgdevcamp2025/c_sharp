export const QUERY_KEYS = {
  messages: (channelId: number) =>
    ['messages', `/subscribe/chat.${channelId}`] as const,
  stocks: () => ['stock', '/subscribe/stock'] as const,
};
