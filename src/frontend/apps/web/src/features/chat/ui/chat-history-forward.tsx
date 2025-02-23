import React, { useEffect, useRef } from 'react';
import { useForwardInfiniteHistory } from '@/src/features/chat/model';
import { CHAT_HISTORY_DUMMY_DATA } from './chat-history-dummy';
import type { ChatHistoryProps } from './chat-history-reverse';

const ChatForwardHistory = ({ containerRef }: ChatHistoryProps) => {
  const channelId = 1; // 상황에 맞게 채널 ID를 설정하세요.

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useForwardInfiniteHistory(channelId);

  // 모든 페이지의 메시지를 합칩니다.
  const messages = data?.pages.flatMap((page) => page.threads) ?? [];

  // 스크롤이 바닥에 가까워지면 다음 페이지를 요청합니다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 스크롤이 바닥에 도달하거나 가까워졌을 때 (10px 여유)
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 10 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={containerRef}
      style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc' }}
    >
      {messages.map((thread) => (
        <div
          key={thread.threadId}
          style={{ padding: '10px', borderBottom: '1px solid #eee' }}
        >
          <div style={{ fontSize: '12px', color: '#888' }}>
            {thread.threadDateTime} - {thread.userNickname}
          </div>
          {thread.messages.map((msg, idx) => (
            <p
              key={idx}
              style={{ margin: '5px 0' }}
            >
              {msg.text}
            </p>
          ))}
        </div>
      ))}

      {hasNextPage && isFetchingNextPage && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          Loading more messages...
        </div>
      )}
    </div>
  );
};

export default ChatForwardHistory;
