export const QUERY_KEYS = {
  messages: (channelId: number) =>
    ['messages', `/subscribe/chat.${channelId}`] as const,
  stock: (stockCode: string) => ['stock', stockCode] as const,
  forwardHistory: (channelId: number) => ['forwardHistory', channelId] as const,
  reverseHistory: (channelId: number) => ['reverseHistory', channelId] as const,
};
