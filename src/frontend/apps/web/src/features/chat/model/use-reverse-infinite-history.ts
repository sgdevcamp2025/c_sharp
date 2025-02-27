import { useInfiniteQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared/services';

import { getHistoryChat } from '../api';
import type { HistoryResponse } from '../model';

export function useReverseInfiniteHistory(channelId: number) {
  const queryKey = QUERY_KEYS.reverseHistory(channelId);

  return useInfiniteQuery<HistoryResponse>({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      if (pageParam === undefined) {
        const data = getHistoryChat(channelId, 'backward', undefined, 30);
        return data;
      }
      const data = getHistoryChat(
        channelId,
        'backward',
        pageParam as number,
        30,
      );
      return data;
    },
    getNextPageParam: (lastPage: HistoryResponse): number | undefined =>
      lastPage.hasNext && lastPage.lastCursorId !== null
        ? lastPage.lastCursorId
        : undefined,
    initialPageParam: undefined,

    staleTime: Infinity,
    gcTime: Infinity,
  });
}
