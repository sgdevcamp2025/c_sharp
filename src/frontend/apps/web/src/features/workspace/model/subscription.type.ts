export type WorkspaceSubscriptionResponse = {
  workspaceId: number;
  createUserId: number;
  channelId: number;
  channelName: string;
  createdAt: Date;
};

export type UnreadSubscriptionResponse = {
  channelId: number;
  channelName: string;
};
