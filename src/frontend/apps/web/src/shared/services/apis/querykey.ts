export const QUERY_KEYS = {
  messages: (channelId: number) =>
    ['messages', `/subscribe/chat.${channelId}`] as const,
  stock: (stockCode: string) => ['stock', stockCode] as const,
  forwardHistory: (channelId: number) => ['forwardHistory', channelId] as const,
  reverseHistory: (channelId: number) => ['reverseHistory', channelId] as const,
  workspaceList: (workspaceId: number) =>
    ['workspaceList', workspaceId] as const,
  workspaceMessages: (workspaceId: number) =>
    ['workspaceMessages', `/subscribe/workspace.${workspaceId}`] as const,
  notificationWorkspaceMessages: (
    sessionId: string | null,
    workspaceId: number,
  ) =>
    [
      'notificationWorkspaceMessages',
      `/subscribe/notification.${sessionId}/workspace.${workspaceId}`,
    ] as const,
};
