'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const REQUESTLIST = [
  ['1', 'H0STCNT0', '005930'],
  ['1', 'H0STCNT0', '000660'],
  ['1', 'H0STCNT0', '035720'],
  ['1', 'H0STCNT0', '035420'],
  ['1', 'H0STCNT0', '012450'],
] as const;

type WebSocketContextType = {
  stockData: any;
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
  const [data1, setData1] = useState('');
  const [data2, setData2] = useState('');
  const [data3, setData3] = useState('');
  const [data4, setData4] = useState('');
  const [data5, setData5] = useState('');
  const setters = [setData1, setData2, setData3, setData4, setData5];
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
        if (event.data.includes('PINGPONG')) {
          pingCount.current += 1;

          if (pingCount.current >= 3) {
            console.log('WebSocket Stopping');
            socket.close();
            socketRef.current = null;
            return;
          }

          socket.send(event.data);
        } else if (event.data.includes('SUCCESS')) {
          return;
        } else {
          pingCount.current = 0;

          // 응답을 REQUESTLIST와 매칭하여 저장
          const matchedIndex = REQUESTLIST.findIndex(([_, __, code]) =>
            event.data.includes(code),
          );
          if (matchedIndex !== -1) {
            setters[matchedIndex](event.data); // 해당 종목 코드의 setter를 호출하여 데이터 업데이트
          } else {
            console.warn('❌ 응답에서 종목 코드를 찾을 수 없음:', event.data);
          }
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
  const stockData = [
    { code: REQUESTLIST[0][2], data: data1 },
    { code: REQUESTLIST[1][2], data: data2 },
    { code: REQUESTLIST[2][2], data: data3 },
    { code: REQUESTLIST[3][2], data: data4 },
    { code: REQUESTLIST[4][2], data: data5 },
  ];
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
