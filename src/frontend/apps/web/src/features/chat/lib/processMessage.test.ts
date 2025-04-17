import { describe, it, expect } from 'vitest';
import type {
  WebSocketResponsePayload,
  WebSocketCommon,
  WebSocketMessage,
} from '@/src/entities/chat';
import { processMessages } from './processMessage.util';

const createMessage = (
  common: WebSocketCommon,
  message: WebSocketMessage[],
): WebSocketResponsePayload => ({
  common,
  message,
});

const createCommon = (
  channelId: number,
  threadId: number,
  threadDateTime: string,
  userId: number,
  userNickname: string,
  userProfileImage: string,
  fakeThreadId?: number,
): WebSocketCommon => ({
  channelId,
  threadId,
  threadDateTime,
  userId,
  userNickname,
  userProfileImage,
  fakeThreadId,
});

const createTextMessage = (text: string): WebSocketMessage => ({
  type: 'TEXT',
  text,
});
const createImageMessage = (
  imageId: number,
  imageUrl: string,
): WebSocketMessage => ({
  type: 'IMAGE',
  imageId,
  imageUrl,
});
const createVideoMessage = (
  videoId: number,
  videoUrl: string,
  videoThumnailId?: number,
  thumbnailUrl?: string,
): WebSocketMessage => ({
  type: 'VIDEO',
  videoId,
  videoUrl,
  videoThumnailId,
  thumbnailUrl,
});

describe('processMessages', () => {
  it('should return an empty array for an empty input', () => {
    const messages: WebSocketResponsePayload[] = [];
    const result = processMessages(messages);
    expect(result).toEqual([]);
  });

  it('should process a single message with isConsecutive and hideAvatar as false', () => {
    const messages = [
      createMessage(
        createCommon(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hello')],
      ),
    ];
    const result = processMessages(messages);
    expect(result).toEqual([
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: '2023-10-15T14:30:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hello')],
        isConsecutive: false,
        hideAvatar: false,
      },
    ]);
  });

  it('should mark consecutive messages from the same user with isConsecutive and hideAvatar as true', () => {
    const messages = [
      createMessage(
        createCommon(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hello')],
      ),
      createMessage(
        createCommon(1, 2, '2023-10-15T14:31:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hi again')],
      ),
    ];
    const result = processMessages(messages);
    expect(result).toEqual([
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: '2023-10-15T14:30:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hello')],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        common: {
          channelId: 1,
          threadId: 2,
          threadDateTime: '2023-10-15T14:31:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hi again')],
        isConsecutive: true,
        hideAvatar: true,
      },
    ]);
  });

  it('should mark non-consecutive messages from different users with isConsecutive and hideAvatar as false', () => {
    const messages = [
      createMessage(
        createCommon(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hello')],
      ),
      createMessage(
        createCommon(1, 2, '2023-10-15T14:31:00Z', 2, 'User2', 'profile2.jpg'),
        [createTextMessage('Hi there')],
      ),
    ];
    const result = processMessages(messages);
    expect(result).toEqual([
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: '2023-10-15T14:30:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hello')],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        common: {
          channelId: 1,
          threadId: 2,
          threadDateTime: '2023-10-15T14:31:00Z',
          userId: 2,
          userNickname: 'User2',
          userProfileImage: 'profile2.jpg',
        },
        message: [createTextMessage('Hi there')],
        isConsecutive: false,
        hideAvatar: false,
      },
    ]);
  });

  it('should correctly process a mix of consecutive and non-consecutive messages', () => {
    const messages = [
      createMessage(
        createCommon(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hello')],
      ),
      createMessage(
        createCommon(1, 2, '2023-10-15T14:31:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hi again')],
      ),
      createMessage(
        createCommon(1, 3, '2023-10-15T14:32:00Z', 2, 'User2', 'profile2.jpg'),
        [createImageMessage(1, 'image1.jpg')],
      ),
      createMessage(
        createCommon(1, 4, '2023-10-15T14:33:00Z', 2, 'User2', 'profile2.jpg'),
        [createVideoMessage(1, 'video1.mp4', 1, 'thumbnail1.jpg')],
      ),
    ];
    const result = processMessages(messages);
    expect(result).toEqual([
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: '2023-10-15T14:30:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hello')],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        common: {
          channelId: 1,
          threadId: 2,
          threadDateTime: '2023-10-15T14:31:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hi again')],
        isConsecutive: true,
        hideAvatar: true,
      },
      {
        common: {
          channelId: 1,
          threadId: 3,
          threadDateTime: '2023-10-15T14:32:00Z',
          userId: 2,
          userNickname: 'User2',
          userProfileImage: 'profile2.jpg',
        },
        message: [createImageMessage(1, 'image1.jpg')],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        common: {
          channelId: 1,
          threadId: 4,
          threadDateTime: '2023-10-15T14:33:00Z',
          userId: 2,
          userNickname: 'User2',
          userProfileImage: 'profile2.jpg',
        },
        message: [createVideoMessage(1, 'video1.mp4', 1, 'thumbnail1.jpg')],
        isConsecutive: true,
        hideAvatar: true,
      },
    ]);
  });

  it('should handle different message types correctly', () => {
    const messages = [
      createMessage(
        createCommon(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg'),
        [createTextMessage('Hello')],
      ),
      createMessage(
        createCommon(1, 2, '2023-10-15T14:31:00Z', 1, 'User1', 'profile1.jpg'),
        [createImageMessage(1, 'image1.jpg')],
      ),
      createMessage(
        createCommon(1, 3, '2023-10-15T14:32:00Z', 2, 'User2', 'profile2.jpg'),
        [createVideoMessage(1, 'video1.mp4', 1, 'thumbnail1.jpg')],
      ),
    ];
    const result = processMessages(messages);
    expect(result).toEqual([
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: '2023-10-15T14:30:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createTextMessage('Hello')],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        common: {
          channelId: 1,
          threadId: 2,
          threadDateTime: '2023-10-15T14:31:00Z',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'profile1.jpg',
        },
        message: [createImageMessage(1, 'image1.jpg')],
        isConsecutive: true,
        hideAvatar: true,
      },
      {
        common: {
          channelId: 1,
          threadId: 3,
          threadDateTime: '2023-10-15T14:32:00Z',
          userId: 2,
          userNickname: 'User2',
          userProfileImage: 'profile2.jpg',
        },
        message: [createVideoMessage(1, 'video1.mp4', 1, 'thumbnail1.jpg')],
        isConsecutive: false,
        hideAvatar: false,
      },
    ]);
  });
});
