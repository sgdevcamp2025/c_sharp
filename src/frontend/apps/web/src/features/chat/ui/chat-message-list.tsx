import ChatMessageItem from './chat-message-item';
import ChatReverseHistory from './chat-history-reverse';
import ChatForwardHistory from './chat-history-forward';

import { useChatAutoScroll, type WebSocketResponsePayload } from '../model';
import { processMessages } from '../lib';
import { Toaster } from '@workspace/ui/components';

export type ChatContentProps = {
  type?: 'default' | 'live';
  messages?: WebSocketResponsePayload[];
};

const ChatMessageList = ({
  type = 'default',
  messages = [],
}: ChatContentProps) => {
  const { bottomRef, containerRef } = useChatAutoScroll(messages);

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
