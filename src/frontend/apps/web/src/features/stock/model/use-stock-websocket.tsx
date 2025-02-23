import { useCallback } from 'react';

import { useStompWebSocket } from '@/src/shared/providers';

export const useStockWebSocket = () => {
  const { client, isConnected } = useStompWebSocket();

  const subscribe = useCallback(() => {
    if (!client) {
      console.error('❌ WebSocket Client가 없습니다.');
      return;
    }

    if (!isConnected) {
      console.warn(
        '⏳ WebSocket이 아직 연결되지 않았습니다. 구독을 대기합니다.',
      );
      return;
    }

    console.log(`📡 Subscribing to /subscribe/chat/stock`);
    const subscription = client.subscribe(`/subscribe/stock`, (message) => {
      try {
        const payload = JSON.parse(message.body);
        console.log('📩 Received:', payload);
      } catch (error) {
        console.error('❌ 메시지 파싱 실패:', error);
      }
    });

    return () => {
      console.log(`📴 Unsubscribing from /subscribe/stock`);
      subscription.unsubscribe();
    };
  }, [client, isConnected]);

  return { subscribe };
};
