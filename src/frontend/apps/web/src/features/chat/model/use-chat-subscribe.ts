import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type {
  SendMessagePayload,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';
import { useStompWebSocket } from '@/src/shared/providers';
import { QUERY_KEYS } from '@/src/shared/services';

export const useChatSubscribe = (channelId: number) => {
  const queryClient = useQueryClient();
  const { client } = useStompWebSocket();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (client && client.connected) {
      setIsConnected(true);
    }
  }, [client]);

  const subscribe = () => {
    if (!client) {
      console.error('❌ WebSocket Client가 없습니다.');
      return;
    }

    if (!client.connected) {
      console.warn(
        '⏳ WebSocket이 아직 연결되지 않았습니다. 구독을 대기합니다.',
      );
      return;
    }

    // console.log(`📡 Subscribing to /subscribe/chat.${channelId}`);
    const subscription = client.subscribe(
      `/subscribe/chat.${channelId}`,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log('📩 Received:', payload);

          queryClient.setQueryData(
            QUERY_KEYS.messages(channelId),
            (prev: WebSocketResponsePayload[] = []) => [...prev, payload],
          );
        } catch (error) {
          console.error('❌ 메시지 파싱 실패:', error);
        }
      },
    );

    return () => {
      console.log(`📴 Unsubscribing from /subscribe/chat.${channelId}`);
      subscription.unsubscribe();
    };
  };

  const publishMessage = useCallback(
    (payload: SendMessagePayload) => {
      if (!client || !client.connected) {
        console.error('❌ WebSocket 연결이 되어 있지 않습니다.');
        return;
      }

      const enrichedPayload = {
        ...payload,
      };

      client.publish({
        destination: `/publish/chat.${channelId}`,
        body: JSON.stringify(enrichedPayload),
      });
    },
    [client, channelId],
  );

  return { subscribe, publishMessage, isConnected };
};
