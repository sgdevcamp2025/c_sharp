import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { WebSocketResponsePayload } from '@/src/entities/chat';

import { useChatMessages } from './useChatMessages';

const TestComponent = ({ topic }: { topic: string }) => {
  const { data } = useChatMessages(topic);
  return <div data-testid="messages">{JSON.stringify(data)}</div>;
};

describe('useChatMessages', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('returns an empty array when no data exists in the cache', () => {
    const topic = 'test-topic';
    render(<TestComponent topic={topic} />, { wrapper });
    const messagesDiv = screen.getByTestId('messages');
    expect(messagesDiv.textContent).toEqual('[]');
  });

  test('returns cached data if available', () => {
    const topic = 'test-topic';
    const initialData: WebSocketResponsePayload[] = [
      {
        common: {
          channelId: 1,
          threadId: 1,
          threadDateTime: new Date().toISOString(),
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'http://example.com/profile.png',
        },
        message: [{ type: 'TEXT', text: 'Hello' }],
      },
    ];

    queryClient.setQueryData(['messages', topic], initialData);
    render(<TestComponent topic={topic} />, { wrapper });
    const messagesDiv = screen.getByTestId('messages');
    expect(messagesDiv.textContent).toEqual(JSON.stringify(initialData));
  });
});
