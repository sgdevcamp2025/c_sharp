import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { QUERY_KEYS } from '@/src/shared/services';

import { useUnreadSubscription } from './useUnreadSubscription';

// 테스트에서 사용할 모의 Subscription 객체
const mockSubscription = { unsubscribe: vi.fn() };

// 모의 client 객체
const mockClient = {
  connected: true,
  subscribe: vi.fn(),
};

// 테스트용 고정 sessionId 값
const dummySessionId = 'dummy-session';

// useStompWebSocket 훅을 모킹: 전역 변수로 설정하여 테스트 내에서 쉽게 제어하도록 함
vi.mock('@/src/shared/providers', () => ({
  useStompWebSocket: () => ({
    client: global.__mockClient,
    sessionId: global.__mockSessionId,
  }),
}));

describe('useUnreadSubscription', () => {
  let queryClient: QueryClient;
  const workspaceId = 123;
  // QUERY_KEYS.notificationWorkspaceMessages(sessionId, workspaceId)로 생성되는 key
  const queryKey = QUERY_KEYS.notificationWorkspaceMessages(
    dummySessionId,
    workspaceId,
  );

  // QueryClientProvider로 래핑하기 위한 wrapper 컴포넌트
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient();
    global.__mockClient = mockClient;
    global.__mockSessionId = dummySessionId;
    mockClient.connected = true;
    mockClient.subscribe.mockReset();
    mockClient.subscribe.mockReturnValue(mockSubscription);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should log error and return undefined if client is null', () => {
    global.__mockClient = null;
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUnreadSubscription(workspaceId), {
      wrapper,
    });
    act(() => {
      const unsubscribe = result.current.subscribe();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ WebSocket Client가 없습니다.'),
      );
      expect(unsubscribe).toBeUndefined();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should log warning and return undefined if client is not connected', () => {
    mockClient.connected = false;
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUnreadSubscription(workspaceId), {
      wrapper,
    });
    act(() => {
      const unsubscribe = result.current.subscribe();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⏳ WebSocket이 아직 연결되지 않았습니다'),
      );
      expect(unsubscribe).toBeUndefined();
    });
    consoleWarnSpy.mockRestore();
  });

  it('should log warning and return undefined if sessionId is null', () => {
    global.__mockSessionId = null;
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUnreadSubscription(workspaceId), {
      wrapper,
    });
    act(() => {
      const unsubscribe = result.current.subscribe();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⏳ SessionId가 아직 설정되지 않았습니다'),
      );
      expect(unsubscribe).toBeUndefined();
    });
    consoleWarnSpy.mockRestore();
  });

  it('should subscribe and update query data on receiving a valid message', () => {
    const { result } = renderHook(() => useUnreadSubscription(workspaceId), {
      wrapper,
    });
    act(() => {
      const unsubscribe = result.current.subscribe();
      // subscribe가 올바른 경로와 콜백 함수를 인자로 호출하는지 확인
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        `/subscribe/notification.${dummySessionId}/workspace.${workspaceId}`,
        expect.any(Function),
      );
      // subscribe에 전달된 콜백 함수 획득
      const callback = mockClient.subscribe.mock.calls[0][1];
      const validPayload = { channelId: 1, channelName: 'Test Channel' };
      act(() => {
        callback({ body: JSON.stringify(validPayload) });
      });
      expect(queryClient.getQueryData(queryKey)).toEqual(validPayload);
      // unsubscribe 호출 시, subscription.unsubscribe()가 호출되어야 함
      unsubscribe && unsubscribe();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  it('should log error if message parsing fails', () => {
    const { result } = renderHook(() => useUnreadSubscription(workspaceId), {
      wrapper,
    });
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    act(() => {
      result.current.subscribe();
      const callback = mockClient.subscribe.mock.calls[0][1];
      callback({ body: 'invalid json' });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ 메시지 파싱 실패:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
