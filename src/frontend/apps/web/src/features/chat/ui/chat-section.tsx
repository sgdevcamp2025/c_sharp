'use client';
import { useQueryClient } from '@tanstack/react-query';

import { useMessages, useWebSocketClient } from '@/src/features/chat/model';

import ChatContent from './chat-content';
import ChatTextarea from './chat-textarea';

import { useSendMessage } from '../lib';
// import ThreadPanel from './thread-panel';

const ChatSection = () => {
  const channelId = 1;
  const currentUser = {
    userId: 1,
    nickname: 'User',
    profileImage: 'https://via.placeholder.com/150',
  };
  const { data: messages, addOptimisticMessage } = useMessages(
    `/subscribe/chat.${channelId}`,
  );
  const { publishMessage } = useWebSocketClient(channelId);
  const queryClient = useQueryClient();

  const handleSendMessage = useSendMessage(channelId, currentUser);

  return (
    <div className="relative flex flex-1 h-full">
      <div className="flex flex-col w-full h-full relative">
        <div className="flex flex-1 flex-col w-full h-full min-h-0 overflow-y-auto pb-[64px]">
          <ChatContent messages={messages} />
        </div>
        <div className="pr-4 pl-4 pb-4 flex-shrink-0 sticky bottom-0 bg-white shadow-md">
          <ChatTextarea onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
