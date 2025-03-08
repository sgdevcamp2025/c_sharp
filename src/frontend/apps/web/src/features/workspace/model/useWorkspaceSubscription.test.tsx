import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWorkspaceSubscription } from './useWorkspaceSubscription';
import { QUERY_KEYS } from '@/src/shared/services';
import type { WorkspaceSubscriptionResponse } from '@/src/entities/workspace';

// 모의 subscription 객체
const mockSubscription = {
  unsubscribe: vi.fn(),
};

// 모의 client 객체
const mockClient = {
  connected: true,
  subscribe: vi.fn(),
};

// useStompWebSocket 모킹: 글로벌 변수로 client를 제어
vi.mock('@/src/shared/providers', () => ({
  useStompWebSocket: () => ({
    client: global.__mockClient,
  }),
}));

describe('useWorkspaceSubscription', () => {
  let queryClient: QueryClient;
  const workspaceId = 123;
  const queryKey = QUERY_KEYS.workspaceMessages(workspaceId);

  // QueryClientProvider로 감싸기 위한 wrapper 컴포넌트
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient();
    global.__mockClient = mockClient;
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
    const { result } = renderHook(() => useWorkspaceSubscription(workspaceId), {
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
    const { result } = renderHook(() => useWorkspaceSubscription(workspaceId), {
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

  it('should subscribe and update query data on receiving a valid message, and unsubscribe correctly', () => {
    const { result } = renderHook(() => useWorkspaceSubscription(workspaceId), {
      wrapper,
    });
    let unsubscribe: (() => void) | undefined;
    act(() => {
      unsubscribe = result.current.subscribe();
    });
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      `/subscribe/workspace.${workspaceId}`,
      expect.any(Function),
    );
    // subscribe에 전달된 콜백 함수 획득
    const callback = mockClient.subscribe.mock.calls[0][1];
    const validPayload: WorkspaceSubscriptionResponse = {
      workspaceId,
      createUserId: 1,
      channelId: 10,
      channelName: 'Test Channel',
      // JSON.parse로 파싱하면 Date 객체는 문자열이 됨
      createdAt: new Date('2023-12-31T15:00:00.000Z') as any,
    };
    // 테스트 비교 시, createdAt을 toISOString()으로 변환
    const expectedPayload = {
      ...validPayload,
      createdAt: new Date('2023-12-31T15:00:00.000Z').toISOString(),
    };
    act(() => {
      callback({ body: JSON.stringify(validPayload) });
    });
    expect(queryClient.getQueryData(queryKey)).toEqual(expectedPayload);
    act(() => {
      unsubscribe && unsubscribe();
    });
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should log error if message parsing fails', () => {
    const { result } = renderHook(() => useWorkspaceSubscription(workspaceId), {
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
