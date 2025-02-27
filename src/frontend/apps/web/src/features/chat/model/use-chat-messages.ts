import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { WebSocketResponsePayload } from '@/src/features/chat/model';

export const useChatMessages = (topic: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['messages', topic];

  const { data: messages = [] } = useQuery<WebSocketResponsePayload[]>({
    queryKey,
    initialData: () =>
      queryClient.getQueryData<WebSocketResponsePayload[]>(queryKey) ?? [],
    staleTime: Infinity,
  });

  return { data: messages };
};
