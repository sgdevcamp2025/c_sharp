import { useInfiniteQuery } from '@tanstack/react-query';

import { getHistoryChat } from '../api';
import type { HistoryResponse } from '../model';

export function useForwardInfiniteHistory(channelId: number) {
  return useInfiniteQuery<HistoryResponse>({
    queryKey: ['forwardHistory', channelId],
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      return getHistoryChat(channelId, 'forward', pageParam as number, 3);
    },
    getNextPageParam: (lastPage: HistoryResponse): number | undefined =>
      lastPage.hasNext && lastPage.lastCursorId !== null
        ? lastPage.lastCursorId
        : undefined,
    initialPageParam: undefined,
  });
}
