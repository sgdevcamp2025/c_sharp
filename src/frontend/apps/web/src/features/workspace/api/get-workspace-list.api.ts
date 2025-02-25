import { serverFetchInstance, TAG_KEYS } from '@/src/shared/services';

export type joinChannelResponse = {
  channelId: number;
  channelName: string;
  createdAt: Date;
  unreadNum?: number;
};

export type unjoinChannelResponse = {
  channelId?: number;
  channelName?: string;
  createdAt?: Date;
};

export type WorkspaceListResponse = {
  joinedChannels: joinChannelResponse[];
  unjoinedChannels: unjoinChannelResponse[];
};

export const getWorkspaceList = async (workspaceId: number) => {
  return serverFetchInstance<WorkspaceListResponse, never>(
    `/api/v1/workspace/${workspaceId}/channels`,
    'GET',
    {
      includeAuthToken: true,
      cache: 'force-cache',
      revalidate: 300,
      tags: [`${TAG_KEYS.WORKSPACE_CHANNEL(workspaceId)}`],
    },
  );
};
