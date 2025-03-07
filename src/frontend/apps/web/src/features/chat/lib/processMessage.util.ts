import type { WebSocketResponsePayload } from '@/src/entities/chat';

export const processMessages = (
  messages: WebSocketResponsePayload[],
): (WebSocketResponsePayload & {
  isConsecutive: boolean;
  hideAvatar: boolean;
})[] => {
  return messages.map((message, index, arr) => {
    const isConsecutive =
      index > 0 && arr[index - 1].common.userId === message.common.userId;
    const hideAvatar = isConsecutive;
    return { ...message, isConsecutive, hideAvatar };
  });
};
