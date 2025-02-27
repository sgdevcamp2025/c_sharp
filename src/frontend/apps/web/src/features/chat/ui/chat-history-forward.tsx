import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useForwardInfiniteHistory } from '@/src/features/chat/model';
import { processChatHistory } from '../lib/process-chat-history.util';
import ChatHistoryItem from './chat-history-item';
import { Badge, Separator } from '@workspace/ui/components';
import { useChatId } from '@/src/shared';

export type ChatHistoryProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ChatForwardHistory = ({ containerRef }: ChatHistoryProps) => {
  const { channelId } = useChatId();

  const [isNearBottom, setIsNearBottom] = useState(false);
  const scrollThreshold = 100;
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useForwardInfiniteHistory(Number(channelId));

  const messages = data?.pages.flatMap((page) => page.threads) ?? [];
  const processedThreads = processChatHistory(messages);

  useEffect(() => {
    const container = containerRef.current;
    if (container && data && data.pages.length === 1) {
      container.scrollTop = 0;
    }
  }, [data, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isLoadingRef.current) return;

      const distanceToBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      const isCloseToBottom = distanceToBottom <= scrollThreshold;

      if (isCloseToBottom && !isNearBottom) {
        setIsNearBottom(true);
      } else if (!isCloseToBottom && isNearBottom) {
        setIsNearBottom(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, isNearBottom]);

  useEffect(() => {
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;

        const prevScrollTop = container.scrollTop;
        const prevScrollHeight = container.scrollHeight;
        isLoadingRef.current = true;

        fetchNextPage()
          .then(() => {
            const newScrollHeight = container.scrollHeight;

            container.scrollTop =
              prevScrollTop + (newScrollHeight - prevScrollHeight);
            isLoadingRef.current = false;
          })
          .catch(() => {
            isLoadingRef.current = false;
          });
      }, 300);
    }

    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [
    isNearBottom,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    containerRef,
  ]);

  return (
    <>
      {processedThreads.length > 0 && (
        <div className="flex items-center w-full space-x-2">
          <Separator className="flex-1" />
          <Badge
            size="default"
            variant="default"
            className="whitespace-nowrap flex-shrink-0"
          >
            읽은 내용
          </Badge>
          <Separator className="flex-1" />
        </div>
      )}

      {processedThreads.map((thread) => (
        <ChatHistoryItem
          key={thread.threadId}
          thread={thread}
        />
      ))}

      {hasNextPage && isFetchingNextPage && (
        <div className="flex w-full p-[10px] justify-center">
          <Loader2
            className="animate-spin"
            color="#F87315"
          />
        </div>
      )}
    </>
  );
};

export default ChatForwardHistory;
