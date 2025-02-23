import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useForwardInfiniteHistory } from '@/src/features/chat/model';
import { processChatHistory } from '../lib/process-chat-history.util';
import ChatHistoryItem from './chat-history-item';

export type ChatHistoryProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ChatForwardHistory = ({ containerRef }: ChatHistoryProps) => {
  const channelId = 1;
  const initialCursor = undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useForwardInfiniteHistory(channelId, initialCursor);

  const messages = data?.pages.flatMap((page) => page.threads) ?? [];
  const processedThreads = processChatHistory(messages);

  useEffect(() => {
    const container = containerRef.current;
    if (container && data && data.pages.length === 1) {
      container.scrollTop = 0;
    }
  }, [data, containerRef]);

  // 스크롤 이벤트: 사용자가 스크롤 하단에 도달하면 fetchNextPage 호출 후 스크롤 보정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 10 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        // fetch 전 현재 컨테이너 전체 높이를 기록합니다.
        const prevScrollHeight = container.scrollHeight;
        fetchNextPage().then(() => {
          const newScrollHeight = container.scrollHeight;
          // 새로운 메시지들이 추가되어 전체 높이가 늘어난 만큼 scrollTop을 보정합니다.
          container.scrollTop += newScrollHeight - prevScrollHeight;
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

export default ChatForwardHistory;
