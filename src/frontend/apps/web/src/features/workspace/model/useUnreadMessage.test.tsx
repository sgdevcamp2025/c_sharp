import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QUERY_KEYS } from '@/src/shared/services';

import { useUnreadMessages } from './useUnreadMessages';

// useStompWebSocket 모킹: 고정 sessionId 반환
const mockSessionId = 'dummy-session';
vi.mock('@/src/shared', () => ({
  useStompWebSocket: () => ({
    sessionId: mockSessionId,
  }),
}));

describe('useUnreadMessages', () => {
  let queryClient: QueryClient;
  const workspaceId = 123;
  const queryKey = QUERY_KEYS.notificationWorkspaceMessages(
    mockSessionId,
    workspaceId,
  );

  // QueryClientProvider로 감싸기 위한 래퍼 컴포넌트
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('should return initial data from queryClient if present', () => {
    const dummyData = { unread: 10 };
    // queryKey에 해당하는 데이터를 미리 세팅
    queryClient.setQueryData(queryKey, dummyData);
    const { result } = renderHook(() => useUnreadMessages(workspaceId), {
      wrapper,
    });
    expect(result.current.data).toEqual(dummyData);
  });

  it('should return null if no initial data is set', () => {
    // queryClient에 아무런 데이터도 세팅하지 않은 경우, 초기 데이터는 null이어야 함
    const { result } = renderHook(() => useUnreadMessages(workspaceId), {
      wrapper,
    });
    expect(result.current.data).toBeNull();
  });
});
