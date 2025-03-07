import React from 'react';
import {
  render,
  waitFor,
  screen,
  act,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useReverseInfiniteHistory } from './useReverseInfiniteHistory';
import { getHistoryChat } from '../api';

// getHistoryChat API를 모킹
vi.mock('../api', () => ({
  getHistoryChat: vi.fn(),
}));

// QueryClient 생성 헬퍼
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });

// useReverseInfiniteHistory 훅을 사용하는 테스트 컴포넌트
function TestComponent({ channelId }: { channelId: number }) {
  const query = useReverseInfiniteHistory(channelId);
  return (
    <div>
      <div data-testid="status">{query.status}</div>
      <div data-testid="data">{JSON.stringify(query.data)}</div>
      {/* fetchNextPage를 onClick 핸들러로 호출 */}
      <button
        data-testid="fetch-next-page"
        onClick={() => query.fetchNextPage()}
      >
        Fetch Next Page
      </button>
    </div>
  );
}

describe('useReverseInfiniteHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call getHistoryChat with undefined pageParam for initial query', async () => {
    const channelId = 1;
    const historyResponse = {
      hasNext: true,
      lastCursorId: 200,
      threads: [],
    };

    (getHistoryChat as any).mockResolvedValueOnce(historyResponse);

    render(<TestComponent channelId={channelId} />, { wrapper });

    // 쿼리가 성공할 때까지 기다림
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });

    expect(getHistoryChat).toHaveBeenCalledWith(
      channelId,
      'backward',
      undefined,
      30,
    );
    expect(screen.getByTestId('data').textContent).toContain(
      JSON.stringify(historyResponse),
    );
  });

  it('should call getHistoryChat with pageParam when fetchNextPage is triggered and getNextPageParam works', async () => {
    const channelId = 1;
    // 첫 번째 페이지 응답
    const historyResponse1 = {
      hasNext: true,
      lastCursorId: 200,
      threads: [
        {
          channelId,
          threadId: 1,
          threadDateTime: '2024-03-08T12:00:00',
          userId: 1,
          userNickname: 'User1',
          userProfileImage: 'url1',
          messages: [{ type: 'TEXT', text: 'Reverse Hello' }],
        },
      ],
    };

    // 두 번째 페이지 응답 (더 이상 다음 페이지 없음)
    const historyResponse2 = {
      hasNext: false,
      lastCursorId: null,
      threads: [
        {
          channelId,
          threadId: 2,
          threadDateTime: '2024-03-08T12:05:00',
          userId: 2,
          userNickname: 'User2',
          userProfileImage: 'url2',
          messages: [{ type: 'TEXT', text: 'Reverse World' }],
        },
      ],
    };

    (getHistoryChat as any).mockResolvedValueOnce(historyResponse1);
    (getHistoryChat as any).mockResolvedValueOnce(historyResponse2);

    render(<TestComponent channelId={channelId} />, { wrapper });

    // 첫 번째 페이지 성공을 기다림
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });
    expect(getHistoryChat).toHaveBeenCalledWith(
      channelId,
      'backward',
      undefined,
      30,
    );
    expect(screen.getByTestId('data').textContent).toContain(
      JSON.stringify(historyResponse1),
    );

    // fetchNextPage 버튼 클릭 (두 번째 페이지 호출)
    act(() => {
      fireEvent.click(screen.getByTestId('fetch-next-page'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('data').textContent).toContain(
        JSON.stringify(historyResponse2),
      );
    });
    expect(getHistoryChat).toHaveBeenCalledWith(
      channelId,
      'backward',
      historyResponse1.lastCursorId,
      30,
    );
  });
});
