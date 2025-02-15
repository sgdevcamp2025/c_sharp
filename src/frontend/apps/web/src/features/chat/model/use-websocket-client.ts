import { useRef, useCallback } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  SendMessagePayload,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';
import { getBaseUrl } from '@/src/shared/services/lib';
import { useQueryClient } from '@tanstack/react-query';
import type { ApiServerType } from '@/src/shared/services/models';

export const useWebSocketClient = (
  serverType: ApiServerType,
  channelId: number,
) => {
  const queryClient = useQueryClient();
  const client = useRef<StompJs.Client | null>(null);
  const BASE_URL = getBaseUrl(serverType);

  const connect = useCallback(() => {
    if (client.current) {
      client.current.deactivate();
    }

    client.current = new StompJs.Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws-connect`),
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('[DEBUG]', msg),
      onConnect: () => {
        client.current?.subscribe(`/subscribe/chat.${channelId}`, (message) => {
          try {
            const payload: WebSocketResponsePayload = JSON.parse(message.body);
            // console.log('Parsed payload:', payload);

            queryClient.setQueryData<WebSocketResponsePayload[]>(
              ['messages', `/subscribe/chat.${channelId}`],
              (prev = []) => [...prev, payload],
            );
          } catch (error) {
            console.error('메시지 파싱 실패:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message'], frame.body);
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.current.activate();
  }, [BASE_URL, channelId, queryClient]);

  const disconnect = useCallback(() => {
    if (client.current) {
      client.current.deactivate();
      client.current = null;
    }
  }, []);

  const publishMessage = useCallback(
    (payload: SendMessagePayload) => {
      if (client.current && client.current.connected) {
        client.current.publish({
          destination: `/publish/chat.${channelId}`,
          body: JSON.stringify(payload),
        });
      } else {
        console.error('WebSocket 연결이 되어 있지 않습니다.');
      }
    },
    [channelId],
  );

  return { connect, disconnect, publishMessage };
};
