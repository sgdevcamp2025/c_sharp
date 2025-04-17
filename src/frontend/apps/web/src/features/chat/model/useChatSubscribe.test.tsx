import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useChatSubscribe } from './useChatSubscribe';

// React Query 모킹: useQueryClient를 호출할 때마다 동일한 mockQueryClient 객체를 반환하도록 함
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

// QUERY_KEYS 모킹 (절대 경로 대신 직접 모킹)
vi.mock('@/src/shared/services', () => ({
  QUERY_KEYS: {
    messages: (channelId: number) => ['messages', channelId],
  },
}));

// WebSocket Client 모킹
const mockClient = {
  connected: true,
  subscribe: vi.fn(),
  publish: vi.fn(),
};

// useStompWebSocket 모킹: 글로벌 변수 global.__mockClient를 반환하도록 함
vi.mock('@/src/shared/providers', () => ({
  useStompWebSocket: () => ({
    client: global.__mockClient,
    isConnected: !!global.__mockClient,
    sessionId: 'test-session-id',
  }),
}));

describe('useChatSubscribe', () => {
  const channelId = 123;
  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 테스트 기본값: client가 존재하며 연결됨
    global.__mockClient = mockClient;
    mockClient.connected = true;
    // subscribe 호출 시 mockSubscription 반환
    mockClient.subscribe.mockReturnValue(mockSubscription);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // 1. client가 연결된 경우 isConnected가 true인지 확인
  it('should set isConnected true when client is connected', () => {
    const { result } = renderHook(() => useChatSubscribe(channelId));
    expect(result.current.isConnected).toBe(true);
  });

  // 2. client가 null인 경우 subscribe() 호출 시 에러 로그가 호출되어야 함
  it('should not subscribe and log error when client is null', () => {
    global.__mockClient = null;
    const { result } = renderHook(() => useChatSubscribe(channelId));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const unsubscribe = result.current.subscribe();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('WebSocket Client'),
    );
    expect(unsubscribe).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });

  // 3. client가 존재하지만 연결되지 않은 경우 subscribe() 호출 시 경고 로그가 호출되어야 함
  it('should not subscribe and log warning when client is not connected', () => {
    mockClient.connected = false;
    const { result } = renderHook(() => useChatSubscribe(channelId));
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

  // 4. subscribe() 호출 시 구독이 정상적으로 이루어지고, 반환된 unsubscribe 함수를 호출하면 subscription.unsubscribe()가 실행되어야 함
  it('should subscribe and return an unsubscribe function', () => {
    const { result } = renderHook(() => useChatSubscribe(channelId));
    const unsubscribe = result.current.subscribe();
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      `/subscribe/chat.${channelId}`,
      expect.any(Function),
    );
    act(() => {
      unsubscribe && unsubscribe();
    });
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  // 5. subscribe() 내부의 메시지 콜백에서 올바른 JSON 메시지를 수신하면 queryClient.setQueryData가 호출되어야 함
  it('should update query data when a valid message is received', () => {
    const { result } = renderHook(() => useChatSubscribe(channelId));
    result.current.subscribe();
    // subscribe() 호출 시 전달된 콜백 함수 획득
    const callback = mockClient.subscribe.mock.calls[0][1];
    const validPayload = {
      common: {
        channelId: channelId,
        threadId: 1,
        threadDateTime: '2024-03-08T12:34:56',
        userId: 999,
        userNickname: 'Tester',
        userProfileImage: 'profile.png',
      },
      message: [{ type: 'TEXT', text: 'Hello' }],
    };
    act(() => {
      callback({ body: JSON.stringify(validPayload) });
    });
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['messages', channelId],
      expect.any(Function),
    );
  });

  // 6. subscribe() 내부의 메시지 콜백에서 잘못된 JSON을 수신하면 에러 로그가 호출되어야 함
  it('should log error when message parsing fails', () => {
    const { result } = renderHook(() => useChatSubscribe(channelId));
    result.current.subscribe();
    const callback = mockClient.subscribe.mock.calls[0][1];
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    act(() => {
      callback({ body: 'invalid json' });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ 메시지 파싱 실패:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  // 7. publishMessage: client가 연결되어 있으면 정상적으로 메시지를 발행해야 함
  it('should publish message when client is connected', () => {
    const { result } = renderHook(() => useChatSubscribe(channelId));
    const payload = {
      userId: 123,
      content: 'Hello',
      attachmentList: [],
    };
    act(() => {
      result.current.publishMessage(payload);
    });
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: `/publish/chat.${channelId}`,
      body: JSON.stringify(payload),
    });
  });

  // 8. publishMessage: client가 null 또는 연결되어 있지 않으면 에러 로그가 호출되어야 함
  it('should log error when publishing message if client is null or not connected', () => {
    // case 1: client가 null인 경우
    global.__mockClient = null;
    const { result } = renderHook(() => useChatSubscribe(channelId));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    act(() => {
      result.current.publishMessage({
        userId: 123,
        content: 'Test',
        attachmentList: [],
      });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ WebSocket 연결이 되어 있지 않습니다.',
    );
    consoleErrorSpy.mockClear();
    // case 2: client가 존재하지만 connected가 false인 경우
    global.__mockClient = mockClient;
    mockClient.connected = false;
    act(() => {
      result.current.publishMessage({
        userId: 123,
        content: 'Test',
        attachmentList: [],
      });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ WebSocket 연결이 되어 있지 않습니다.',
    );
    consoleErrorSpy.mockRestore();
  });
});
