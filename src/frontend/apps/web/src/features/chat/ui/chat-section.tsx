'use client';
import { useChatMessages } from '@/src/features/chat/model';
import { getUserIdFromCookie } from '@/src/shared/services';

import ChatItemList from './chat-message-list';
import ChatTextarea from './chat-textarea';

import { useSendMessage } from '../model';
import { useEffect, useState } from 'react';
import { useChatId } from '@/src/shared';

const ChatSection = ({ stockSlug }: { stockSlug: string }) => {
  const { channelId } = useChatId();

  const [currentUser, setCurrentUser] = useState({
    userId: null,
    nickname: '',
    profileImage: '',
  });
  useEffect(() => {
    async function fetchUser() {
      const userId = await getUserIdFromCookie();
      const storedUser = JSON.parse(localStorage.getItem('user'));

      setCurrentUser({
        userId,
        nickname: storedUser.nickname || '',
        profileImage: storedUser.profileImage || '',
      });
    }
    fetchUser();
  }, []);

  const { data: messages } = useChatMessages(`/subscribe/chat.${channelId}`);
  const handleSendMessage = useSendMessage(channelId, currentUser);

  return (
    <div className="relative flex flex-1 h-full">
      <div className="flex flex-col w-full h-full relative">
        <div className="flex flex-1 flex-col w-full h-full min-h-0 overflow-y-auto pb-[64px]">
          <ChatItemList messages={messages} />
        </div>
        <div className="pr-4 pl-4 pb-4 flex-shrink-0 sticky bottom-0 bg-white shadow-md">
          <ChatTextarea
            onSend={handleSendMessage}
            stockSlug={stockSlug}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
