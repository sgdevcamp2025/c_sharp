import { clientFetchInstance, TAG_KEYS } from '@/src/shared/services';

import type { HistoryResponse } from '../model';

export const getHistoryChat = async (
  channelId: number,
  direction: string,
  cursorId: number | undefined,
  size = 20,
): Promise<HistoryResponse> => {
  const params: Record<string, string> = {
    size: String(size),
  };
  if (cursorId !== undefined) {
    params.cursorId = String(cursorId);
  }
  return clientFetchInstance<HistoryResponse, never>(
    `/api/v1/history/${direction}/${channelId}`,
    'GET',
    {
      params,
      includeAuthToken: true,
      cache: 'force-cache',
      revalidate: 300,
      tags: [`${TAG_KEYS.CHAT_HISTORY(channelId)}`],
    },
  );
};
