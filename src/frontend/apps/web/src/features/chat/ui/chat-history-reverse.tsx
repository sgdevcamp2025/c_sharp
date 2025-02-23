import React, { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import { useReverseInfiniteHistory } from '@/src/features/chat/model';

import { processChatHistory } from '../lib';
import ChatHistoryItem from './chat-history-item';

export type ChatHistoryProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ChatReverseHistory = ({ containerRef }: ChatHistoryProps) => {
  const channelId = 1;
  const initialCursor = undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReverseInfiniteHistory(channelId, initialCursor);

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
      if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        const prevScrollHeight = container.scrollHeight;
        fetchNextPage().then(() => {
          const newScrollHeight = container.scrollHeight;

          container.scrollTop = newScrollHeight - prevScrollHeight;
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
