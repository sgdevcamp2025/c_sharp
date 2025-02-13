import { Client } from '@stomp/stompjs';
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { getRequest } from '../services';
import type { ApiServerType } from '../services';

const fetchMessages = async (serverType: ApiServerType, topic: string) => {
  try {
    return await getRequest<unknown[]>(serverType, `/api/messages/${topic}`, {
      cache: 'no-store',
    });
  } catch (error) {
    console.error('❌ 메시지 불러오기 실패:', error);
    return [];
  }
};

export const useMessages = (serverType: ApiServerType, topic: string) => {
  return useSuspenseQuery({
    queryKey: ['messages', topic],
    queryFn: () => fetchMessages(serverType, topic),
    staleTime: Infinity,
  });
};

export const useSendMessage = (stompClient: Client | null, topic: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string | object) => {
      if (!stompClient || !stompClient.active || !stompClient.connected) {
        console.warn('⚠️ STOMP WebSocket이 아직 연결되지 않음.');
        throw new Error('STOMP WebSocket이 연결되지 않음.');
      }
      const body =
        typeof message === 'string' ? message : JSON.stringify(message);
      stompClient.publish({ destination: topic, body });
      console.log(`✉️ STOMP 메시지 전송: ${topic}`, message);
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ['messages', topic],
        (oldData: unknown[] = []) => {
          return [...oldData, newMessage];
        },
      );
    },
  });
};
