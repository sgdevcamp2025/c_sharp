export type MessageItem = {
  channelId: number;
  threadId: number;
  threadDateTime: string;
  userId: number;
  userNickname: string;
  userProfileImage: string;
  messages: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO';
    text?: string;
    imageId?: number;
    imageUrl?: string;
    videoId?: number;
    videoUrl?: string;
  }[];
};

export type HistoryResponse = {
  hasNext: boolean;
  lastCursorId: number | null;
  threads: MessageItem[];
};
