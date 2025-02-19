import { formatToKoreanDate } from '@/src/features/chat/lib';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMessages,
  useWebSocketClient,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';

export const useSendMessage = (
  channelId: number,
  currentUser: { userId: number; nickname: string; profileImage: string },
) => {
  const queryClient = useQueryClient();
  const { addOptimisticMessage } = useMessages(`/subscribe/chat.${channelId}`);
  const { publishMessage } = useWebSocketClient(channelId);

  return (content: string, attachmentList: number[]) => {
    if (!content.trim() && attachmentList.length === 0) return;

    const fakeThreadId = Math.floor(Math.random() * 1000000);
    const fakeTimestamp = formatToKoreanDate(new Date());

    const optimisticMessage = {
      common: {
        channelId,
        threadId: fakeThreadId,
        fakeThreadId,
        threadDateTime: fakeTimestamp,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        userProfileImage: currentUser.profileImage,
      },
      message: [{ type: 'TEXT' as const, text: content }],
    };

    addOptimisticMessage(optimisticMessage);

    const payload = {
      userId: currentUser.userId,
      content,
      attachmentList,
      fakeThreadId,
    };

    publishMessage(payload);

    queryClient.setQueryData(
      ['messages', `/subscribe/chat.${channelId}`],
      (prevMessages: WebSocketResponsePayload[] = []) =>
        prevMessages.map((msg) =>
          msg.common.fakeThreadId === fakeThreadId
            ? { ...msg, isOptimistic: false }
            : msg,
        ),
    );
  };
};
