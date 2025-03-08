import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useStockWebSocket } from './useStockWebSocket';

// React Query 모킹: useQueryClient를 호출할 때마다 동일한 mockQueryClient 객체를 반환하도록 설정
const mockQueryClient = {
  setQueryData: vi.fn((key, updater) => {
    if (typeof updater === 'function') {
      return updater([]);
    }
    return updater;
  }),
};
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

// QUERY_KEYS 모킹
vi.mock('@/src/shared/services', () => ({
  QUERY_KEYS: {
    stock: (code: string) => ['stock', code],
  },
}));

// WebSocket Client 모킹
const mockClient = {
  connected: true,
  subscribe: vi.fn(),
  publish: vi.fn(),
};

// useStompWebSocket 모킹: 글로벌 변수 global.__mockClient를 반환
vi.mock('@/src/shared/providers', () => ({
  useStompWebSocket: () => ({
    client: global.__mockClient,
    isConnected: !!global.__mockClient && global.__mockClient.connected,
    sessionId: 'test-session-id',
  }),
}));

describe('useStockWebSocket', () => {
  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 테스트 기본값: client가 존재하며 연결된 상태
    global.__mockClient = mockClient;
    mockClient.connected = true;
    // subscribe 호출 시 mockSubscription 반환
    mockClient.subscribe.mockReturnValue(mockSubscription);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // 1. client가 null인 경우, subscribe() 호출 시 에러 로그가 출력되어야 함
  it('should log error and return undefined when client is null', () => {
    global.__mockClient = null;
    const { result } = renderHook(() => useStockWebSocket());
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const unsubscribe = result.current.subscribe();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('WebSocket Client가 없습니다'),
    );
    expect(unsubscribe).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });

  // 2. client는 존재하지만 연결되지 않은 경우, subscribe() 호출 시 경고 로그가 출력되어야 함
  it('should log warning and return undefined when client is not connected', () => {
    mockClient.connected = false;
    const { result } = renderHook(() => useStockWebSocket());
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const unsubscribe = result.current.subscribe();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('WebSocket이 아직 연결되지 않았습니다'),
    );
    expect(unsubscribe).toBeUndefined();
    consoleWarnSpy.mockRestore();
  });

  // 3. 정상적인 구독 동작: subscribe() 호출 시 구독이 이루어지고 반환된 unsubscribe 함수를 호출하면 subscription.unsubscribe()가 실행되어야 함
  it('should subscribe and return an unsubscribe function', () => {
    const { result } = renderHook(() => useStockWebSocket());
    const unsubscribe = result.current.subscribe();
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      `/subscribe/stock`,
      expect.any(Function),
    );
    act(() => {
      unsubscribe && unsubscribe();
    });
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  // 4. subscribe() 내부의 메시지 콜백에서 올바른 JSON 메시지를 수신하면 queryClient.setQueryData가 호출되어야 함
  it('should update query data when a valid message is received', () => {
    const { result } = renderHook(() => useStockWebSocket());
    result.current.subscribe();
    // subscribe() 호출 시 전달된 콜백 함수 획득
    const callback = mockClient.subscribe.mock.calls[0][1];
    const validPayload = {
      code: 'ABC',
      price: 100,
    };
    act(() => {
      callback({ body: JSON.stringify(validPayload) });
    });
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['stock', validPayload.code],
      expect.any(Function),
    );
  });

  // 5. subscribe() 내부의 메시지 콜백에서 잘못된 JSON을 수신하면 에러 로그가 출력되어야 함
  it('should log error when message parsing fails', () => {
    const { result } = renderHook(() => useStockWebSocket());
    result.current.subscribe();
    const callback = mockClient.subscribe.mock.calls[0][1];
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    act(() => {
      callback({ body: 'invalid json' });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '메시지 파싱 실패:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
