import ContentText from './content-text';
import ContentAvatar from './content-avatar';
import ChatReverseHistory from './chat-history-reverse';
import ChatForwardHistory from './chat-history-forward';

import { useChatAutoScroll, type WebSocketResponsePayload } from '../model';
import { processMessages } from '../lib';
import { Toaster } from '@workspace/ui/components';
import { useEffect, useState } from 'react';

export type ChatContentProps = {
  type?: 'default' | 'live';
  messages?: WebSocketResponsePayload[];
};

const ChatContent = ({ type = 'default', messages = [] }: ChatContentProps) => {
  const { bottomRef, containerRef } = useChatAutoScroll(messages);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // if (!messages || messages.length === 0) return null;
  // console.log('🔗 ChatContent:', { messages });

  const backgroundColor = type === 'live' ? 'bg-live' : 'bg-white';
  const hoverColor = type === 'default' ? 'hover:bg-chatboxHover' : '';

  const processedMessages = processMessages(messages);

  console.log(messages);

  return (
    <>
      <div
        ref={containerRef}
        className={`flex flex-col w-full pb-2 overflow-auto h-full ${backgroundColor}`}
      >
        <ChatReverseHistory containerRef={containerRef} />
        {/* <ChatForwardHistory containerRef={containerRef} /> */}
        {processedMessages.map((messageData, index) => (
          <div
            key={index}
            className={`group relative flex w-full pl-5 ${
              messageData.isConsecutive ? 'pt-2' : 'pt-5'
            } pl-5 pr-6 gap-4 ${hoverColor} transition-all duration-300`}
          >
            {messageData.hideAvatar ? (
              <></>
            ) : (
              <ContentAvatar
                type={type}
                userProfileImage={messageData.common.userProfileImage}
              />
            )}

            <div className="flex w-full items-start justify-between">
              <ContentText
                type={type}
                // avatarUrls={avatarUrls}
                message={messageData}
                // setIsThreadOpen={setIsThreadOpen}
                hideUserInfo={messageData.isConsecutive}
              />
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <Toaster />
    </>
  );
};

export default ChatContent;
