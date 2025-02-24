import { useWebSocketClient } from '@/src/features/chat/model';

export const useSendMessage = (
  channelId: number,
  currentUser: { userId: number; nickname: string; profileImage: string },
) => {
  const { publishMessage } = useWebSocketClient(channelId);

  return (content: string, attachmentList: number[]) => {
    if (!content.trim() && attachmentList.length === 0) return;

    const payload = {
      userId: currentUser.userId,
      content,
      attachmentList,
    };

    publishMessage(payload);
  };
};
