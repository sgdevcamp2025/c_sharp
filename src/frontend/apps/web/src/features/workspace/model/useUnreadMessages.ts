import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared/services';
import { useStompWebSocket } from '@/src/shared';
import type { UnreadSubscriptionResponse } from '@/src/entities/workspace';

export const useUnreadMessages = (workspaceId: number) => {
  const queryClient = useQueryClient();
  const { sessionId } = useStompWebSocket();
  const queryKey = QUERY_KEYS.notificationWorkspaceMessages(
    sessionId,
    workspaceId,
  );

  const { data: message } = useQuery<UnreadSubscriptionResponse | null>({
    queryKey,
    initialData: () =>
      queryClient.getQueryData<UnreadSubscriptionResponse | null>(queryKey) ??
      null,
    staleTime: Infinity,
  });

  return { data: message };
};
