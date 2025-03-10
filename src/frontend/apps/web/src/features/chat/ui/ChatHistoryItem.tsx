import React from 'react';

import Image from 'next/image';

import type { MessageItem } from '@/src/entities/chat';

import ContentAvatar from './MessageAvatar';
import { formatChatTime } from '../lib';

type ThreadType = MessageItem & {
  isConsecutive: boolean;
  hideAvatar: boolean;
};

type ChatThreadItemProps = {
  thread: ThreadType;
};

const ChatHistoryItem = ({ thread }: ChatThreadItemProps) => {
  return (
    <div className="group relative flex w-full pl-5 pt-5 pr-6 gap-4 bg-white hover:bg-chatboxHover transition-all duration-300">
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
              <div className="text-base font-bold">{thread.userNickname}</div>
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
                {msg.text?.replace(/\\n/g, '\n')}
              </div>
            )}
            {msg.type === 'IMAGE' && msg.imageUrl && (
              <Image
                src={msg.imageUrl}
                alt="Image"
                width={256}
                height={256}
                className="max-w-72 max-h-72 object-cover border border-gray-300 rounded-md"
              />
            )}
            {msg.type === 'VIDEO' && msg.videoUrl && (
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
  );
};

export default ChatHistoryItem;
