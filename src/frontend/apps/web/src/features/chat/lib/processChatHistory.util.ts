import type { MessageItem } from '@/src/entities/chat';

export const processChatHistory = (
  threads: MessageItem[],
): (MessageItem & { isConsecutive: boolean; hideAvatar: boolean })[] => {
  return threads.map((thread, index, arr) => {
    const isConsecutive = index > 0 && arr[index - 1].userId === thread.userId;
    const hideAvatar = isConsecutive;
    return { ...thread, isConsecutive, hideAvatar };
  });
};
