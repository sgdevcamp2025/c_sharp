import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useInvalidateChatHistory } from './useInvalidateChatHistory';

// QUERY_KEYS 모킹 (경로에 맞게 설정)
vi.mock('@/src/shared', () => ({
  QUERY_KEYS: {
    forwardHistory: (channelId: number) => ['forwardHistory', channelId],
    reverseHistory: (channelId: number) => ['reverseHistory', channelId],
  },
}));

// 훅을 사용하는 테스트 컴포넌트
function TestComponent({ channelId }: { channelId: number }) {
  useInvalidateChatHistory(channelId);
  return <div>Test</div>;
}

describe('useInvalidateChatHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
  });

  it('should invalidate forward and reverse queries when channelId is provided', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent channelId={1} />
      </QueryClientProvider>,
    );

    // useEffect가 실행될 때까지 기다림
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });

    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(1, {
      queryKey: ['forwardHistory', 1],
    });
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(2, {
      queryKey: ['reverseHistory', 1],
    });

    // channelId 변경 시 다시 무효화되는지 테스트
    invalidateQueriesSpy.mockClear();
    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent channelId={2} />
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(1, {
      queryKey: ['forwardHistory', 2],
    });
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(2, {
      queryKey: ['reverseHistory', 2],
    });
  });

  it('should not invalidate queries when channelId is falsy', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent channelId={0} />
      </QueryClientProvider>,
    );

    // 채널 ID가 falsy(0)면 useEffect에서 바로 리턴하므로 호출되지 않아야 함
    await waitFor(() => {
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
  });
});
