import { Client } from '@stomp/stompjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchMessages = async (topic: string): Promise<unknown[]> => {
  const response = await fetch(`/api/messages/${topic}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

export const useMessages = (topic: string) => {
  return useQuery({
    queryKey: ['messages', topic],
    queryFn: () => fetchMessages(topic),
    staleTime: Infinity,
    initialData: [],
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
