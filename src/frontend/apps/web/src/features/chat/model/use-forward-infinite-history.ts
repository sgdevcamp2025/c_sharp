import { useInfiniteQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared/services';

import { getHistoryChat } from '../api';
import type { HistoryResponse } from '../model';

export function useForwardInfiniteHistory(channelId: number) {
  const queryKey = QUERY_KEYS.forwardHistory(channelId);

  return useInfiniteQuery<HistoryResponse>({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      if (pageParam === undefined) {
        return getHistoryChat(channelId, 'forward', undefined, 5);
      }
      return getHistoryChat(channelId, 'forward', pageParam as number, 5);
    },
    getNextPageParam: (lastPage: HistoryResponse): number | undefined =>
      lastPage.hasNext && lastPage.lastCursorId !== null
        ? lastPage.lastCursorId
        : undefined,
    initialPageParam: undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!channelId,
  });
}
