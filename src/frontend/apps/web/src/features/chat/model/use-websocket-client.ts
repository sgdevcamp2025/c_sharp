import { useCallback, useEffect, useState } from 'react';
import type {
  SendMessagePayload,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';
import { useQueryClient } from '@tanstack/react-query';
import { useStompWebSocket } from '@/src/shared/providers/stomp-websocket-provider';

export const useWebSocketClient = (channelId: number) => {
  const queryClient = useQueryClient();
  const { client } = useStompWebSocket();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (client && client.connected) {
      setIsConnected(true);
    }
  }, [client]);

  const subscribe = useCallback(() => {
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

    console.log(`📡 Subscribing to /subscribe/chat.${channelId}`);
    const subscription = client.subscribe(
      `/subscribe/chat.${channelId}`,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log('📩 Received:', payload);

          queryClient.setQueryData(
            ['messages', `/subscribe/chat.${channelId}`],
            (prev: WebSocketResponsePayload[] = []) => {
              return prev.map((msg) =>
                msg.common.fakeThreadId === payload.common.threadId
                  ? {
                      ...payload,
                      common: { ...payload.common, fakeThreadId: undefined },
                    }
                  : msg,
              );
            },
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
  }, [client, channelId, queryClient]);

  const publishMessage = useCallback(
    (payload: SendMessagePayload & { fakeThreadId: number }) => {
      if (!client || !client.connected) {
        console.error('❌ WebSocket 연결이 되어 있지 않습니다.');
        return;
      }

      const enrichedPayload = {
        ...payload,
        fakeThreadId: payload.fakeThreadId,
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
