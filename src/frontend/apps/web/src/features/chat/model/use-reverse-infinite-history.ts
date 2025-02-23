import { useInfiniteQuery } from '@tanstack/react-query';

import { getHistoryChat } from '../api';
import type { HistoryResponse } from '../model';

export function useReverseInfiniteHistory(channelId: number) {
  return useInfiniteQuery<HistoryResponse>({
    queryKey: ['reverseHistory', channelId],
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      return getHistoryChat(channelId, 'backward', pageParam as number, 30);
    },
    getNextPageParam: (lastPage: HistoryResponse): number | undefined =>
      lastPage.hasNext && lastPage.lastCursorId !== null
        ? lastPage.lastCursorId
        : undefined,
    initialPageParam: undefined,
  });
}
