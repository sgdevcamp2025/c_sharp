import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared/services';

import type { WorkspaceSubscriptionResponse } from './subscription.type';

export const useWorkspaceMessages = (workspaceId: number) => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.workspaceMessages(workspaceId);

  const { data: message } = useQuery<WorkspaceSubscriptionResponse | null>({
    queryKey,
    initialData: () =>
      queryClient.getQueryData<WorkspaceSubscriptionResponse | null>(
        queryKey,
      ) ?? null,
    staleTime: Infinity,
  });

  return { data: message };
};
