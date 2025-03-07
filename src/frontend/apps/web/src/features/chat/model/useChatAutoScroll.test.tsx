import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

import type { WebSocketResponsePayload } from '@/src/entities/chat';

import { useChatAutoScroll } from './useChatAutoScroll';

const toastMock = vi.fn();
const dismissMock = vi.fn();
vi.mock('@workspace/ui/hooks/Toast/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
    dismiss: dismissMock,
  }),
}));

const createDummyPayload = (text: string): WebSocketResponsePayload => ({
  common: {
    channelId: 1,
    threadId: 1,
    threadDateTime: new Date().toISOString(),
    userId: 1,
    userNickname: 'TestUser',
    userProfileImage: 'http://example.com/profile.png',
  },
  message: [{ type: 'TEXT', text }],
});

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

function TestComponent({ messages }: { messages: WebSocketResponsePayload[] }) {
  const { containerRef, bottomRef } = useChatAutoScroll(messages);
  return (
    <div
      data-testid="container"
      ref={containerRef}
      style={{ overflow: 'auto', height: '200px' }}
    >
      <div style={{ height: '500px' }}>
        {messages.map((payload, idx) =>
          payload.message.map((msg, i) => (
            <div key={`${idx}-${i}`}>{msg.type === 'TEXT' ? msg.text : ''}</div>
          )),
        )}
      </div>
      <div
        data-testid="bottom"
        ref={bottomRef}
      />
    </div>
  );
}

function NoContainerTest({
  messages,
}: {
  messages: WebSocketResponsePayload[];
}) {
  const { bottomRef } = useChatAutoScroll(messages);
  return (
    <div
      data-testid="no-container"
      ref={bottomRef}
    >
      No container
    </div>
  );
}

describe('useChatAutoScroll', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  beforeEach(() => {
    originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      cb(0);
      return 0;
    };
    toastMock.mockClear();
    dismissMock.mockClear();
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
  });

  test('should scroll to bottom when a new message is added and user is at the bottom', () => {
    const initialMessages: WebSocketResponsePayload[] = [];
    const { getByTestId, rerender } = render(
      <TestComponent messages={initialMessages} />,
    );
    const container = getByTestId('container');
    const bottom = getByTestId('bottom');

    // Use a spy on the element's scrollIntoView
    const scrollSpy = vi.spyOn(bottom, 'scrollIntoView');

    Object.defineProperty(container, 'scrollTop', {
      value: 250,
      writable: true,
    });
    Object.defineProperty(container, 'scrollHeight', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 200,
      writable: true,
    });

    act(() => {
      fireEvent.scroll(container);
    });

    const newMessages: WebSocketResponsePayload[] = [
      createDummyPayload('Hello'),
    ];
    act(() => {
      rerender(<TestComponent messages={newMessages} />);
    });

    expect(scrollSpy).toHaveBeenCalled();
  });

  test('should show toast when a new message is added and user is not at the bottom', () => {
    const initialMessages: WebSocketResponsePayload[] = [];
    const { getByTestId, rerender } = render(
      <TestComponent messages={initialMessages} />,
    );
    const container = getByTestId('container');

    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 200,
      writable: true,
    });

    act(() => {
      fireEvent.scroll(container);
    });

    const newMessages: WebSocketResponsePayload[] = [
      createDummyPayload('Hello'),
    ];
    act(() => {
      rerender(<TestComponent messages={newMessages} />);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: '새 메시지가 있습니다',
      description: '1개의 새 메시지가 도착했습니다.',
    });
  });

  test('should dismiss toast when user scrolls to the bottom after new message alert', () => {
    const initialMessages: WebSocketResponsePayload[] = [];
    const { getByTestId, rerender } = render(
      <TestComponent messages={initialMessages} />,
    );
    const container = getByTestId('container');

    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 200,
      writable: true,
    });

    act(() => {
      fireEvent.scroll(container);
    });

    const newMessages: WebSocketResponsePayload[] = [
      createDummyPayload('Hello'),
    ];
    act(() => {
      rerender(<TestComponent messages={newMessages} />);
    });
    expect(toastMock).toHaveBeenCalled();

    act(() => {
      Object.defineProperty(container, 'scrollTop', {
        value: 250,
        writable: true,
      });
      fireEvent.scroll(container);
    });
    expect(dismissMock).toHaveBeenCalledWith('new-message');
  });

  test('should not trigger any additional action when message count does not increase', () => {
    const initialMessages: WebSocketResponsePayload[] = [
      createDummyPayload('Initial'),
    ];
    const { getByTestId, rerender } = render(
      <TestComponent messages={initialMessages} />,
    );
    const container = getByTestId('container');

    // Spy on the global Element prototype's scrollIntoView
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

    Object.defineProperty(container, 'scrollTop', {
      value: 250,
      writable: true,
    });
    Object.defineProperty(container, 'scrollHeight', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 200,
      writable: true,
    });

    act(() => {
      fireEvent.scroll(container);
    });

    const initialCallCount = scrollSpy.mock.calls.length;

    // Re-render with the same messages (no increase)
    act(() => {
      rerender(<TestComponent messages={initialMessages} />);
    });

    expect(scrollSpy.mock.calls.length).toEqual(initialCallCount);
    expect(toastMock).not.toHaveBeenCalled();
    expect(dismissMock).not.toHaveBeenCalled();
  });

  test('should handle missing containerRef gracefully', () => {
    const initialMessages: WebSocketResponsePayload[] = [];
    const { rerender } = render(<NoContainerTest messages={initialMessages} />);
    const newMessages: WebSocketResponsePayload[] = [
      createDummyPayload('Hello'),
    ];

    act(() => {
      rerender(<NoContainerTest messages={newMessages} />);
    });

    expect(toastMock).not.toHaveBeenCalled();
    expect(dismissMock).not.toHaveBeenCalled();
  });
});
