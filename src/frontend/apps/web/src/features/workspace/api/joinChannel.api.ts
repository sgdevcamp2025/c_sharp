import { clientFetchInstance, TAG_KEYS } from '@/src/shared/services';

type SuccessResponse = string;

export const joinChannel = async (workspaceId: number, channelId: number) => {
  return clientFetchInstance<SuccessResponse, never>(
    `/api/v1/workspace/${workspaceId}/channels/${channelId}/members`,
    'POST',
    {
      includeAuthToken: true,
      cache: 'force-cache',
      revalidate: 300,
      tags: [`${TAG_KEYS.CHANNEL_MEMBER(channelId)}`],
    },
  );
};
