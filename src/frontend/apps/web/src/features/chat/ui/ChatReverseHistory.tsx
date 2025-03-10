import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useChatId } from '@/src/shared';

import ChatHistoryItem from './ChatHistoryItem';
import { processChatHistory } from '../lib';
import { useReverseInfiniteHistory, type ChatHistoryProps } from '../model';

const ChatReverseHistory = ({ containerRef }: ChatHistoryProps) => {
  const { channelId } = useChatId();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReverseInfiniteHistory(channelId);

  const [isNearTop, setIsNearTop] = useState(false);
  const scrollThreshold = 50;
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // console.log(data?.pages[0].lastCursorId);

  const messages = data?.pages.flatMap((page) => page.threads) ?? [];

  const processedThreads = processChatHistory([...messages].reverse());

  useEffect(() => {
    const container = containerRef.current;
    if (container && data && data.pages.length === 1) {
      container.scrollTop = container.scrollHeight;
    }
  }, [data, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isLoadingRef.current) return;
      const isCloseToTop = container.scrollTop <= scrollThreshold;

      if (isCloseToTop && !isNearTop) {
        setIsNearTop(true);
      } else if (!isCloseToTop && isNearTop) {
        setIsNearTop(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, isNearTop]);

  useEffect(() => {
    if (isNearTop && hasNextPage && !isFetchingNextPage) {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;

        const prevScrollHeight = container.scrollHeight;
        isLoadingRef.current = true;

        fetchNextPage()
          .then(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
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
  }, [isNearTop, hasNextPage, isFetchingNextPage, fetchNextPage, containerRef]);

  return (
    <>
      {hasNextPage && isFetchingNextPage && (
        <div className="flex w-full p-[10px] justify-center">
          <Loader2
            className="animate-spin"
            color="#F87315"
          />
        </div>
      )}

      {processedThreads.map((thread) => (
        <ChatHistoryItem
          key={thread.threadId}
          thread={thread}
        />
      ))}
    </>
  );
};

export default ChatReverseHistory;
