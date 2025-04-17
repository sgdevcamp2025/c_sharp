import { describe, it, expect } from 'vitest';

import type { MessageItem } from '@/src/entities/chat';

import { processChatHistory } from './processChatHistory.util';

const createMessage = (
  channelId: number,
  threadId: number,
  threadDateTime: string,
  userId: number,
  userNickname: string,
  userProfileImage: string,
  messages: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO';
    text?: string;
    imageId?: number;
    imageUrl?: string;
    videoId?: number;
    videoUrl?: string;
  }[],
): MessageItem => ({
  channelId,
  threadId,
  threadDateTime,
  userId,
  userNickname,
  userProfileImage,
  messages,
});

describe('processChatHistory', () => {
  it('should return an empty array for an empty input', () => {
    const threads: MessageItem[] = [];
    const result = processChatHistory(threads);
    expect(result).toEqual([]);
  });

  it('should process a single message with isConsecutive and hideAvatar as false', () => {
    const threads = [
      createMessage(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hello' },
      ]),
    ];
    const result = processChatHistory(threads);
    expect(result).toEqual([
      {
        channelId: 1,
        threadId: 1,
        threadDateTime: '2023-10-15T14:30:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hello' }],
        isConsecutive: false,
        hideAvatar: false,
      },
    ]);
  });

  it('should mark consecutive messages from the same user with isConsecutive and hideAvatar as true', () => {
    const threads = [
      createMessage(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hello' },
      ]),
      createMessage(1, 2, '2023-10-15T14:31:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hi again' },
      ]),
    ];
    const result = processChatHistory(threads);
    expect(result).toEqual([
      {
        channelId: 1,
        threadId: 1,
        threadDateTime: '2023-10-15T14:30:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hello' }],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        channelId: 1,
        threadId: 2,
        threadDateTime: '2023-10-15T14:31:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hi again' }],
        isConsecutive: true,
        hideAvatar: true,
      },
    ]);
  });

  it('should mark non-consecutive messages from different users with isConsecutive and hideAvatar as false', () => {
    const threads = [
      createMessage(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hello' },
      ]),
      createMessage(1, 2, '2023-10-15T14:31:00Z', 2, 'User2', 'profile2.jpg', [
        { type: 'TEXT', text: 'Hi there' },
      ]),
    ];
    const result = processChatHistory(threads);
    expect(result).toEqual([
      {
        channelId: 1,
        threadId: 1,
        threadDateTime: '2023-10-15T14:30:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hello' }],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        channelId: 1,
        threadId: 2,
        threadDateTime: '2023-10-15T14:31:00Z',
        userId: 2,
        userNickname: 'User2',
        userProfileImage: 'profile2.jpg',
        messages: [{ type: 'TEXT', text: 'Hi there' }],
        isConsecutive: false,
        hideAvatar: false,
      },
    ]);
  });

  it('should correctly process a mix of consecutive and non-consecutive messages', () => {
    const threads = [
      createMessage(1, 1, '2023-10-15T14:30:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hello' },
      ]),
      createMessage(1, 2, '2023-10-15T14:31:00Z', 1, 'User1', 'profile1.jpg', [
        { type: 'TEXT', text: 'Hi again' },
      ]),
      createMessage(1, 3, '2023-10-15T14:32:00Z', 2, 'User2', 'profile2.jpg', [
        { type: 'TEXT', text: 'Hey' },
      ]),
      createMessage(1, 4, '2023-10-15T14:33:00Z', 2, 'User2', 'profile2.jpg', [
        { type: 'TEXT', text: 'Hello again' },
      ]),
    ];
    const result = processChatHistory(threads);
    expect(result).toEqual([
      {
        channelId: 1,
        threadId: 1,
        threadDateTime: '2023-10-15T14:30:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hello' }],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        channelId: 1,
        threadId: 2,
        threadDateTime: '2023-10-15T14:31:00Z',
        userId: 1,
        userNickname: 'User1',
        userProfileImage: 'profile1.jpg',
        messages: [{ type: 'TEXT', text: 'Hi again' }],
        isConsecutive: true,
        hideAvatar: true,
      },
      {
        channelId: 1,
        threadId: 3,
        threadDateTime: '2023-10-15T14:32:00Z',
        userId: 2,
        userNickname: 'User2',
        userProfileImage: 'profile2.jpg',
        messages: [{ type: 'TEXT', text: 'Hey' }],
        isConsecutive: false,
        hideAvatar: false,
      },
      {
        channelId: 1,
        threadId: 4,
        threadDateTime: '2023-10-15T14:33:00Z',
        userId: 2,
        userNickname: 'User2',
        userProfileImage: 'profile2.jpg',
        messages: [{ type: 'TEXT', text: 'Hello again' }],
        isConsecutive: true,
        hideAvatar: true,
      },
    ]);
  });
});
