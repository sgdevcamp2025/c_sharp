export type SendMessagePayload = {
  userId: number;
  content: string;
  attachmentList: number[];
};

export type WebSocketCommon = {
  channelId: number;
  threadId: number;
  threadDateTime: string;
  userId: number;
  userNickname: string;
  userProfileImage: string;
  fakeThreadId?: number;
};

export type WebSocketMessage =
  | { type: 'TEXT'; text: string }
  | { type?: 'IMAGE'; imageId?: number; imageUrl?: string }
  | {
      type?: 'VIDEO';
      videoId?: number;
      videoThumnailId?: number;
      thumbnailUrl?: string;
      videoUrl?: string;
    };

export type WebSocketResponsePayload = {
  common: WebSocketCommon;
  message: WebSocketMessage[];
};
