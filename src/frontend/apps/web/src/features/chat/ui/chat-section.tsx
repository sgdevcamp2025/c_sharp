'use client';

import { useMessages, useWebSocketClient } from '@/src/features/chat/model';
import type {
  SendMessagePayload,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';

// import ThreadPanel from './thread-panel';
import ChatContent from './chat-content';
import ChatTextarea from './chat-textarea';
import { formatToKoreanDate } from '../lib';
import { useQueryClient } from '@tanstack/react-query';

const ChatSection = () => {
  const channelId = 1;
  const currentUser = {
    userId: 1,
    nickname: 'User',
    profileImage: 'https://via.placeholder.com/150',
  };
  // const [isThreadOpen, setIsThreadOpen] = useState<boolean>(false);

  const { data: messages, addOptimisticMessage } = useMessages(
    `/subscribe/chat.${channelId}`,
  );

  // console.log('📚 메시지 목록:', messages);
  const { publishMessage } = useWebSocketClient(channelId);
  const queryClient = useQueryClient();

  const handleSendMessage = (content: string, attachmentList: number[]) => {
    if (!content.trim() && attachmentList.length === 0) return;

    const fakeThreadId = Math.floor(Math.random() * 1000000);
    const fakeTimestamp = formatToKoreanDate(new Date());

    const optimisticMessage: WebSocketResponsePayload = {
      common: {
        channelId,
        threadId: fakeThreadId,
        fakeThreadId,
        threadDateTime: fakeTimestamp,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        userProfileImage: currentUser.profileImage,
      },
      message: [
        {
          type: 'TEXT',
          text: content,
        },
      ],
    };

    addOptimisticMessage(optimisticMessage);

    const payload: SendMessagePayload & { fakeThreadId: number } = {
      userId: currentUser.userId,
      content,
      attachmentList,
      fakeThreadId,
    };

    publishMessage(payload);

    queryClient.setQueryData(
      ['messages', `/subscribe/chat.${channelId}`],
      (prevMessages: WebSocketResponsePayload[] = []) => {
        return prevMessages.map((msg) =>
          msg.common.fakeThreadId === fakeThreadId
            ? { ...msg, isOptimistic: false }
            : msg,
        );
      },
    );
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
