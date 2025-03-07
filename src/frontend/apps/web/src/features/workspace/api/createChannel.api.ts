import { serverFetchInstance, TAG_KEYS } from '@/src/shared/services';

export type WorkspaceResponse = {
  channelId: number;
  channelName: string;
  createdAt: Date;
};

export const createChannel = async (
  workspaceId: number,
  channelName: string,
) => {
  return serverFetchInstance<WorkspaceResponse, never>(
    `/api/v1/workspace/${workspaceId}/channels`,
    'POST',
    {
      includeAuthToken: true,
      params: {
        channelName: channelName,
      },
      cache: 'force-cache',
      revalidate: 300,
      tags: [`${TAG_KEYS.WORKSPACE_CHANNEL(workspaceId)}`],
    },
  );
};
