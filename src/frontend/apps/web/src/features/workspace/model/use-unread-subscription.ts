import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useStompWebSocket } from '@/src/shared/providers';
import { QUERY_KEYS } from '@/src/shared/services';

import type { UnreadSubscriptionResponse } from './subscription.type';

export const useUnreadSubscription = (workspaceId: number) => {
  const queryClient = useQueryClient();
  const { client, sessionId } = useStompWebSocket();
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
    if (!sessionId) {
      console.warn(
        '⏳ SessionId가 아직 설정되지 않았습니다. 구독을 대기합니다.',
      );
      return;
    }

    const subscription = client.subscribe(
      `/subscribe/notification.${sessionId}/workspace.${workspaceId}`,
      (message) => {
        try {
          const payload = JSON.parse(
            message.body,
          ) as UnreadSubscriptionResponse;
          console.log('📩 qweReceived unread message:', payload);
          console.log('unRead success');

          queryClient.setQueryData(
            QUERY_KEYS.notificationWorkspaceMessages(sessionId, workspaceId),
            payload,
          );
        } catch (error) {
          console.error('❌ 메시지 파싱 실패:', error);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, sessionId, workspaceId, queryClient]);

  return { subscribe, isConnected };
};
