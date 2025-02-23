import React, { useEffect } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import { useReverseInfiniteHistory } from '@/src/features/chat/model';

import ContentAvatar from './content-avatar';

import { formatChatTime, processChatHistory } from '../lib';

export type ChatHistoryProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ChatReverseHistory = ({ containerRef }: ChatHistoryProps) => {
  const channelId = 1;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReverseInfiniteHistory(channelId);

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
        <div
          key={thread.threadId}
          className="group relative flex w-full pl-5 pt-5 pr-6 gap-4 bg-white hover:bg-chatboxHover transition-all duration-300"
        >
          {thread.hideAvatar ? null : (
            <ContentAvatar
              type="default"
              userProfileImage={thread.userProfileImage}
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {!thread.isConsecutive && (
                <>
                  <div className="text-base font-bold">
                    {thread.userNickname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatChatTime(thread.threadDateTime, false)}
                  </div>
                </>
              )}
            </div>
            {thread.messages.map((msg, idx) => (
              <div
                key={idx}
                className="text-base flex gap-4 items-center"
              >
                {thread.isConsecutive && (
                  <div className="flex flex-col items-end w-10 h-full text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                    {formatChatTime(thread.threadDateTime, true)}
                  </div>
                )}
                {msg.type === 'TEXT' && (
                  <div className="whitespace-pre-line break-words">
                    {msg.text.replace(/\\n/g, '\n')}
                  </div>
                )}
                {msg.type === 'IMAGE' && (
                  <Image
                    src={msg.imageUrl}
                    alt="Image"
                    className="w-32 h-32"
                  />
                )}
                {msg.type === 'VIDEO' && (
                  <video
                    controls
                    className="w-48 h-48"
                  >
                    <source
                      src={msg.videoUrl}
                      type="video/mp4"
                    />
                  </video>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatReverseHistory;
