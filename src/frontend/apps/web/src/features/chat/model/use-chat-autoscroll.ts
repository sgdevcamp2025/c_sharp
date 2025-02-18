import { useEffect, useRef, useState } from 'react';

import { WebSocketResponsePayload } from './websocket.type';

export const useChatAutoScroll = (messages: WebSocketResponsePayload[]) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const [isUserScrollingUp, setIsUserScrollingUp] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsUserScrollingUp(scrollTop + clientHeight < scrollHeight - 100);
    };

    if (messages.length > prevMessageCount && !isUserScrollingUp) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }

    setPrevMessageCount(messages.length);

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, prevMessageCount, isUserScrollingUp]);

  return { bottomRef, containerRef };
};
