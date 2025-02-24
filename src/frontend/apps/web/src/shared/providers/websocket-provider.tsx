'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../services';

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

  useEffect(() => {
    const url = 'ws://ops.koreainvestment.com:31000';
    const token = 'd8dd055b-62cc-4290-bef1-06fd56e3bc11';

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

        const requestlist = [
          ['1', 'H0STCNT0', '005930'],
          ['1', 'H0STCNT0', '005930'],
          ['1', 'H0STCNT0', '005930'],
          ['1', 'H0STCNT0', '005930'],
          ['1', 'H0STCNT0', '005930'],
        ];
        requestlist.forEach((request) => {
          console.log(request[2]);
          socket.send(
            JSON.stringify({
              header: {
                approval_key: token,
                custtype: 'P',
                tr_type: request[0],
                'content-type': 'utf-8',
              },
              body: {
                input: {
                  tr_id: request[1],
                  tr_key: request[2],
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

          queryClient.setQueryData(QUERY_KEYS.stockList(), event.data);
          setStockData((prev) => {
            const newData = { ...prev, [event.data.code]: event.data };
            return newData;
          });
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
