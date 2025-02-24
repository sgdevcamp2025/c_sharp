export const QUERY_KEYS = {
  messages: (channelId: number) =>
    ['messages', `/subscribe/chat.${channelId}`] as const,
  stock: (stockCode: string) => ['stock', stockCode] as const,
};
