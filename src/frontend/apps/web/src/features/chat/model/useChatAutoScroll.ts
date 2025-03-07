import { useEffect, useRef, useState } from 'react';

import { WebSocketResponsePayload } from '@/src/entities/chat';
import { useToast } from '@workspace/ui/hooks/Toast/use-toast';

export const useChatAutoScroll = (messages: WebSocketResponsePayload[]) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const [isUserScrollingUp, setIsUserScrollingUp] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;

      setIsUserScrollingUp(!isAtBottom);
      if (isAtBottom && newMessageCount > 0) {
        setNewMessageCount(0);
        dismiss('new-message');
      }
    };

    container.addEventListener('scroll', handleScroll);

    if (messages.length > prevMessageCountRef.current) {
      if (!isUserScrollingUp) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        });
      } else {
        setNewMessageCount((prev) => prev + 1);
        toast({
          title: '새 메시지가 있습니다',
          description: `${newMessageCount + 1}개의 새 메시지가 도착했습니다.`,
        });
      }
      prevMessageCountRef.current = messages.length;
    }

    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, isUserScrollingUp, newMessageCount, toast, dismiss]);

  return { bottomRef, containerRef };
};
