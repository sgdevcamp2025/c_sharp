'use client';
import { useMessages } from '@/src/features/chat/model';

import ChatItemList from './chat-message-list';
import ChatTextarea from './chat-textarea';

import { useSendMessage } from '../model';

const ChatSection = () => {
  const channelId = 1;
  const currentUser = {
    userId: 1,
    nickname: 'User',
    profileImage: 'https://via.placeholder.com/150',
  };
  const { data: messages } = useMessages(`/subscribe/chat.${channelId}`);
  const handleSendMessage = useSendMessage(channelId, currentUser);

  return (
    <div className="relative flex flex-1 h-full">
      <div className="flex flex-col w-full h-full relative">
        <div className="flex flex-1 flex-col w-full h-full min-h-0 overflow-y-auto pb-[64px]">
          <ChatItemList messages={messages} />
        </div>
        <div className="pr-4 pl-4 pb-4 flex-shrink-0 sticky bottom-0 bg-white shadow-md">
          <ChatTextarea onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
