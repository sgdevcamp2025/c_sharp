import { Toaster } from '@workspace/ui/components';

import { useChatId } from '@/src/shared';
import { WebSocketResponsePayload } from '@/src/entities/chat';

import ChatMessageItem from './ChatMessageItem';
import ChatReverseHistory from './ChatReverseHistory';
import ChatForwardHistory from './ChatForwardHistory';
import { useChatAutoScroll, useInvalidateChatHistory } from '../model';
import { processMessages } from '../lib';

type ChatContentProps = {
  type?: 'default' | 'live';
  messages?: WebSocketResponsePayload[];
};

const ChatMessageList = ({
  type = 'default',
  messages = [],
}: ChatContentProps) => {
  const { bottomRef, containerRef } = useChatAutoScroll(messages);
  const { channelId } = useChatId();
  useInvalidateChatHistory(channelId);

  // if (!messages || messages.length === 0) return null;
  // console.log('🔗 ChatContent:', { messages });

  const backgroundColor = type === 'live' ? 'bg-live' : 'bg-white';

  const processedMessages = processMessages(messages);

  console.log(messages);

  return (
    <>
      <div
        ref={containerRef}
        className={`flex flex-col w-full pb-2 overflow-auto h-full ${backgroundColor}`}
      >
        <ChatReverseHistory containerRef={containerRef} />
        <ChatForwardHistory containerRef={containerRef} />
        {processedMessages.map((messageData, index) => (
          <ChatMessageItem
            key={index}
            messageData={messageData}
            type={type}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <Toaster />
    </>
  );
};

export default ChatMessageList;
