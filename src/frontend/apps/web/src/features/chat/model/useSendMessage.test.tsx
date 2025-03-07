import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useChatSubscribe } from '@/src/features/chat/model';

import { useSendMessage } from './useSendMessage';

// useChatSubscribe 훅 모킹: publishMessage만 필요한 상태로 모킹합니다.
vi.mock('@/src/features/chat/model', () => ({
  useChatSubscribe: vi.fn(),
}));

describe('useSendMessage', () => {
  const mockPublishMessage = vi.fn();
  const channelId = 1;
  const currentUser = {
    userId: 123,
    nickname: 'TestUser',
    profileImage: 'test.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useChatSubscribe as any).mockReturnValue({
      publishMessage: mockPublishMessage,
    });
  });

  // 테스트를 위한 컴포넌트: useSendMessage 훅을 호출하고, 전달받은 sendMessage 함수를 버튼 클릭 시 실행합니다.
  function TestComponent({
    content,
    attachments,
  }: {
    content: string;
    attachments: number[];
  }) {
    const sendMessage = useSendMessage(channelId, currentUser);
    return (
      <button
        data-testid="send-btn"
        onClick={() => sendMessage(content, attachments)}
      >
        Send
      </button>
    );
  }

  it('should not call publishMessage if content is empty and attachmentList is empty', () => {
    render(
      <TestComponent
        content="   "
        attachments={[]}
      />,
    );
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockPublishMessage).not.toHaveBeenCalled();
  });

  it('should call publishMessage with payload if content is non-empty', () => {
    render(
      <TestComponent
        content="Hello world"
        attachments={[]}
      />,
    );
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockPublishMessage).toHaveBeenCalledWith({
      userId: currentUser.userId,
      content: 'Hello world',
      attachmentList: [],
    });
  });

  it('should call publishMessage if attachmentList is non-empty even if content is empty', () => {
    render(
      <TestComponent
        content="   "
        attachments={[1, 2, 3]}
      />,
    );
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockPublishMessage).toHaveBeenCalledWith({
      userId: currentUser.userId,
      content: '   ',
      attachmentList: [1, 2, 3],
    });
  });
});
