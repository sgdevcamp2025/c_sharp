'use client';
import { useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_SERVER_URL = `${process.env.NEXT_PUBLIC_STOMP_SERVER}`;
const STOMP_PATH = {
  PUB_URL: `${process.env.NEXT_PUBLIC_PUB_URL}`,
  SUB_URL: `${process.env.NEXT_PUBLIC_SUB_URL}`,
  PRIVATE_SUB_URL: `${process.env.NEXT_PUBLIC_PRIVATE_SUB_URL}`,
};

export const useWebsocketHuddle = ({
  userId,
  channelId,
}: {
  userId: number;
  channelId: number;
}) => {
  const stompClient = useRef<StompJs.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  stompClient.current = new StompJs.Client({
    connectHeaders: {
      sessionId: userId.toString(),
    },
    webSocketFactory: () => new SockJS(`${STOMP_SERVER_URL}`),
    onConnect: () => {
      console.log('허들 WebSocket Connected');
      setIsConnected(true);
      console.log('start sub');
      stompClient.current?.subscribe(
        `${STOMP_PATH.PRIVATE_SUB_URL}/${userId}`,
        handlePrivateMessage,
      );
    },
    onStompError: (frame) => {
      console.error(
        '❌ WebSocket error:',
        frame.headers['message'],
        frame.body,
      );
    },
    reconnectDelay: 0,
  });

  stompClient.current.activate();

  const handlePrivateMessage = () => {};

  const sendMessage = (message: string) => {
    if (stompClient.current && stompClient) {
      stompClient.current.publish({
        destination: '/app/chat',
        body: JSON.stringify({ userId, message }),
      });
    }
  };

  return () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsConnected(false);
    }
  };
};
