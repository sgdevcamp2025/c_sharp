import type {
  SendMessagePayload,
  WebSocketResponsePayload,
} from '@/src/features/chat/model';
import { formatToKoreanDate } from '@/src/features/chat/lib';
import { QueryClient } from '@tanstack/react-query';

type SendMessageParams = {
  content: string;
  attachmentList: number[];
  channelId: number;
  currentUser: { userId: number; nickname: string; profileImage: string };
  addOptimisticMessage: (message: WebSocketResponsePayload) => void;
  publishMessage: (
    payload: SendMessagePayload & { fakeThreadId: number },
  ) => void;
  queryClient: QueryClient;
};

export const sendMessage = ({
  content,
  attachmentList,
  channelId,
  currentUser,
  addOptimisticMessage,
  publishMessage,
  queryClient,
}: SendMessageParams) => {
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
