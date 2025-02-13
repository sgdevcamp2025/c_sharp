import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useStompWebSocket = (url: string, topics: string[]) => {
  const queryClient = useQueryClient();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  useEffect(() => {
    const socket = new SockJS(url);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP Debug]', msg),
      onConnect: () => {
        console.log('✅ STOMP WebSocket 연결 성공');

        subscriptionsRef.current = topics.map((topic) =>
          client.subscribe(topic, (message: IMessage) => {
            const newData = JSON.parse(message.body);
            console.log(`📩 새 메시지 수신 (${topic}):`, newData);

            queryClient.setQueryData(
              ['messages', topic],
              (oldData: unknown[]) => [...(oldData || []), newData],
            );
          }),
        );
      },
      onDisconnect: () => {
        console.log('❌ STOMP WebSocket 연결 종료');
      },
      onStompError: (frame) => {
        console.error('🔥 STOMP WebSocket 오류:', frame);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      client.deactivate();
      console.log('🔌 STOMP WebSocket 모든 구독 해제 및 연결 종료');
    };
  }, [url, topics, queryClient]);

  return stompClient;
};

export default useStompWebSocket;
