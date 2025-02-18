'use client';
import { useMessages, useWebSocketClient } from '@/src/features/chat/model';
import type { SendMessagePayload } from '@/src/features/chat/model';

import ChatContent from './chat-content';
import ChatTextarea from './chat-textarea';
// import ThreadPanel from './thread-panel';

const ChatSection = () => {
  const channelId = 1;
  const currentUser = {
    userId: 1,
    nickname: 'User',
    profileImage: 'https://via.placeholder.com/150',
  };
  // const [isThreadOpen, setIsThreadOpen] = useState<boolean>(false);

  const { data: messages } = useMessages(`/subscribe/chat.${channelId}`);

  // console.log('📚 메시지 목록:', messages);
  const { publishMessage } = useWebSocketClient(channelId);

  const handleSendMessage = (content: string, attachmentList: number[]) => {
    if (!content.trim() && attachmentList.length === 0) return;
    const payload: SendMessagePayload = {
      userId: currentUser.userId,
      content,
      attachmentList,
    };

    publishMessage(payload);
  };

  return (
    <div className="relative flex flex-1 h-full">
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-1 flex-col w-full h-full overflow-y-auto">
          <ChatContent
            // setIsThreadOpen={setIsThreadOpen}
            messages={messages}
          />
        </div>
        <div className="p-4">
          <ChatTextarea onSend={handleSendMessage} />
        </div>
      </div>
      {/* <div
        className={`absolute top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isThreadOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full z-50`}
      >
        {isThreadOpen && <ThreadPanel onClose={() => setIsThreadOpen(false)} />}
      </div> */}
    </div>
  );
};

export default ChatSection;
