export const QUERY_KEYS = {
  messages: (channelId: number) =>
    ['messages', `/subscribe/chat.${channelId}`] as const,
  stockList: () => ['stockList'] as const,
  stockData: (code: string) => ['stockData', code] as const,
};
