import { useInfiniteQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared/services';

import { getHistoryChat } from '../api';
import type { HistoryResponse } from '../model';

export function useForwardInfiniteHistory(
  channelId: number,
  initialCursor?: number,
) {
  return useInfiniteQuery<HistoryResponse>({
    queryKey: QUERY_KEYS.forwardHistory(channelId),
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      return getHistoryChat(channelId, 'forward', pageParam as number, 5);
    },
    getNextPageParam: (lastPage: HistoryResponse): number | undefined =>
      lastPage.hasNext && lastPage.lastCursorId !== null
        ? lastPage.lastCursorId
        : undefined,
    initialPageParam: initialCursor,
  });
}
