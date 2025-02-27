export const TAG_KEYS = {
  WORKSPACE_CHANNEL: (workspaceId: number) =>
    ['workspace-channels', `workspace-${workspaceId}`] as const,
  CHAT_HISTORY: (channelId: number) =>
    ['chat-history', `channel-${channelId}`] as const,
};
