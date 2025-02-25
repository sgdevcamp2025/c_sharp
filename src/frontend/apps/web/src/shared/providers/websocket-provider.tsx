'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services';
import { getAccessToken } from '@/src/features/stock';

const REQUESTLIST = [
  ['1', 'H0STCNT0', '005930'],
  ['1', 'H0STCNT0', '000660'],
  ['1', 'H0STCNT0', '035720'],
  ['1', 'H0STCNT0', '035420'],
  ['1', 'H0STCNT0', '012450'],
] as const;

type WebSocketContextType = {
  stockData: Record<string, any>;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const pingCount = useRef<number>(0);
  const [stockData, setStockData] = useState<Record<string, any>>({});

  const url = 'ws://ops.koreainvestment.com:31000';
  useEffect(() => {
    console.log('✅ [Token Received]:', token);

    function setupWebSocket() {
      if (socketRef.current) {
        console.log('🔄 [WebSocket Already Connected]');
        return;
      }

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ [WebSocket Connected]');
        pingCount.current = 0;

        socket.send(JSON.stringify({ token }));

        REQUESTLIST.forEach(([type, id, code]) => {
          socket.send(
            JSON.stringify({
              header: {
                approval_key: token,
                custtype: 'P',
                tr_type: type,
                'content-type': 'utf-8',
              },
              body: {
                input: {
                  tr_id: id,
                  tr_key: code,
                },
              },
            }),
          );
        });
      };

      socket.onmessage = (event) => {
        console.log('WebSocket Message:', event.data);

        if (event.data.includes('PINGPONG')) {
          pingCount.current += 1;

          if (pingCount.current >= 3) {
            console.log('WebSocket Stopping');
            socket.close();
            socketRef.current = null;
            return;
          }

          socket.send(event.data);
        } else {
          pingCount.current = 0;
          const data = JSON.parse(event.data);
          queryClient.setQueryData(QUERY_KEYS.stock(data.code), data);
          setStockData(data);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket Closed');
        socketRef.current = null;
      };
    }

    setupWebSocket();

    return () => {
      if (socketRef.current) {
        console.log('WebSocket Disconnect');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [queryClient]);

  return (
    <WebSocketContext.Provider value={{ stockData }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
