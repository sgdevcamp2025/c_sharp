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

type WebSocketContextProps = {
  client: StompJs.Client | null;
  isConnected: boolean;
};

type WebSocketProviderProps = {
  children: ReactNode;
};

const StompWebSocketContext = createContext<WebSocketContextProps | null>(null);

export const StompWebSocketProvider = ({
  children,
}: WebSocketProviderProps) => {
  const client = useRef<StompJs.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId;
  // const BASE_URL = `http://${process.env.NEXT_PUBLIC_BASE_URL}:${process.env.NEXT_PUBLIC_CHAT_SERVER1_PORT}`;
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
      value={{ client: client.current, isConnected }}
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
