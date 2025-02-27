'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  ReactNode,
} from 'react';
import * as StompJs from '@stomp/stompjs';

import SockJS from 'sockjs-client';
import EventEmitter from 'events';

export const webSocketEvent = new EventEmitter();

type WebSocketContextProps = {
  client: StompJs.Client | null;
  isConnected: boolean;
  sessionId: string;
};

type WebSocketProviderProps = {
  userId: number;
  children: ReactNode;
};

const StompWebSocketContext = createContext<WebSocketContextProps | null>(null);

export const StompWebSocketProvider = ({
  userId,
  children,
}: WebSocketProviderProps) => {
  const client = useRef<StompJs.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const sessionId = useRef<string | null>(null);
  const BASE_URL = `${process.env.NEXT_PUBLIC_REAL_BASE_URL}`;

  const connect = useCallback(() => {
    if (client.current) {
      client.current.deactivate();
    }

    client.current = new StompJs.Client({
      connectHeaders: {
        'X-User-ID': userId.toString(),
      },
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws-connect`),
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('[DEBUG]', msg),
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);

        const socketUrl = client.current.webSocket['_transport'].ws.url;
        sessionId.current = socketUrl.split('/').slice(-2, -1)[0];

        client.current.subscribe(
          `/subscribe/notification.${sessionId.current}`,
          (message) => {
            try {
              const payload = JSON.parse(message.body);
              console.log('📩 Received:', payload);

              webSocketEvent.emit('alarmReceived', payload);
            } catch (error) {
              console.error('❌ 메시지 파싱 실패:', error);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error('❌ Broker error:', frame.headers['message'], frame.body);
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.current.activate();
  }, [BASE_URL, userId]);

  useEffect(() => {
    connect();
    return () => {
      if (client.current) {
        client.current.deactivate();
        client.current = null;
      }
    };
  }, [connect]);

  return (
    <StompWebSocketContext.Provider
      value={{
        client: client.current,
        isConnected,
        sessionId: sessionId.current,
      }}
    >
      {children}
    </StompWebSocketContext.Provider>
  );
};

export const useStompWebSocket = () => {
  const context = useContext(StompWebSocketContext);
  if (!context) {
    throw new Error(
      'useStompWebSocket must be used within a StompWebSocketProvider',
    );
  }
  return context;
};
